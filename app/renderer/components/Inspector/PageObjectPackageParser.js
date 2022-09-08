import { lstatSync, readdirSync, readFileSync } from 'fs';
import { findNodeAtLocation, getNodeValue, parseTree } from 'jsonc-parser';
import { isCustomType } from '@utam/compiler/build/utils/element-types';
import { join, basename } from 'path';
import { UTAM_EXT } from 'utam/build/utils/constants';
import PageObjectTreeNode from '../Inspector/PageObjectTreeNode';

export default class PageObjectPackageParser {
  constructor (packagePath) {
    this.packageDir = packagePath;
    this.rootMap = new Map();
    this.orphans = [];
  }

  buildRootMap () {
    const modules = readdirSync(this.packageDir);
    modules.forEach((module) => {
      let files;
      const modulePath = join(this.packageDir, module);
      if (lstatSync(modulePath).isDirectory()) {
        files = readdirSync(modulePath);
        files.forEach((file) => {
          this.buildRootMapFromFile(file, join(modulePath, file));
        });
      } else {
        const file = module;
        this.buildRootMapFromFile(file, modulePath);
      }
    });
  }

  // Build the root map from Page Object json file
  buildRootMapFromFile (file, filePath) {
    if (file.includes(UTAM_EXT)) {
      this.findRoot(filePath);
    }
  }

  parseInterfaces (pageObjectName, rootNode) {
    const methods = [];
    const children = [];
    const rootSelector = {ios: '', android: ''};

    const methodsNode = findNodeAtLocation(rootNode, ['methods']);
    if (methodsNode && methodsNode.children) {
      methodsNode.children.forEach((methodObjectNode) => {
        // Get all methods info
        const name = findNodeAtLocation(methodObjectNode, ['name']);
        if (name && name.value.length !== 0) {
          methods.push(name.value);
        }

        // Get all children info
        const returnTypeNode = findNodeAtLocation(methodObjectNode, ['returnType']);
        if (returnTypeNode) {
          const returnTypeNodeValue = getNodeValue(returnTypeNode);
          if (isCustomType(returnTypeNodeValue)) {
            const typeValue = returnTypeNodeValue.split('/').pop();
            children.push(new PageObjectTreeNode(typeValue, rootSelector, methods, children));
          }
        }
      });
    }

    // For root Page Object
    const rootMarkerNode = findNodeAtLocation(rootNode, ['root']);
    if (rootMarkerNode !== undefined && rootMarkerNode.value === true) {
      const rootNode = new PageObjectTreeNode(pageObjectName, rootSelector, methods, children);
      if (!this.rootMap.has(pageObjectName)) {
        this.rootMap.set(pageObjectName, rootNode);
      }
    } else {
      // For non-root Page Object
      const childNode = new PageObjectTreeNode(pageObjectName, rootSelector, methods, children);
      for (let [key, value] of this.rootMap) {
        if (value.length !== 0) {
          const existingChildren = value.children;
          for (let i = 0; i < existingChildren.length; i++) {
            if (existingChildren[i].name === pageObjectName) {
              existingChildren[i] = childNode;
              value.children = existingChildren;
              this.rootMap.set(key, value);
              // Get out from the inside for loop
              i = existingChildren.length;
            }
          }
        }
      }
    }
  }

  parseImpls (pageObjectName, rootNode) {
    const rootMarkerNode = findNodeAtLocation(rootNode, ['root']);
    if (rootMarkerNode !== undefined && rootMarkerNode.value === true) {
      const rootSelectorNode = findNodeAtLocation(rootNode, ['selector']);
      const profileNode = findNodeAtLocation(rootNode, ['profile']);
      if (rootSelectorNode && profileNode.children && this.rootMap.has(pageObjectName)) {
        const { methods, children, rootSelector } = this.rootMap.get(pageObjectName);
        const platformNode = profileNode.children[0];
        const platform = platformNode.children[0].children[1].children[0].value.split('_')[0].toLowerCase();
        const selector = rootSelectorNode.children[0].children[1].value;
        if (platform === 'ios') {
          rootSelector.ios = selector;
        } else if (platform === 'android') {
          rootSelector.android = selector;
        }
        const node = new PageObjectTreeNode(pageObjectName, rootSelector, methods, children);
        this.rootMap.set(pageObjectName, node);
      }
    }
  }

  findRoot (filePath) {
    const [pageObjectName] = basename(filePath).split('.');
    const sourceText = readFileSync(filePath, 'utf8');
    const rootNode = parseTree(sourceText, []);
    const interfaceNode = findNodeAtLocation(rootNode, ['interface']);
    const implNode = findNodeAtLocation(rootNode, ['implements']);
    // Parse the interface files
    if (interfaceNode !== undefined && interfaceNode.value === true) {
      this.parseInterfaces(pageObjectName, rootNode);
    } else if (implNode !== undefined && implNode.value.length !== 0) {
      // Parse the implementation files
      this.parseImpls(implNode.value.split('/').pop(), rootNode);
    }
  }

  getMap () {
    return this.rootMap;
  }
}