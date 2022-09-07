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

  findRoot (filePath) {
    const [pageObjectName] = basename(filePath).split('.');
    const sourceText = readFileSync(filePath, 'utf8');
    const rootNode = parseTree(sourceText, []);
    const interfaceNode = findNodeAtLocation(rootNode, ['interface']);
    // Only parse the interface file
    if (interfaceNode !== undefined && interfaceNode.value === true) {
      const methodsNode = findNodeAtLocation(rootNode, ['methods']);

      const methods = [];
      const children = [];
      if (methodsNode && methodsNode.children) {
        methodsNode.children.forEach((methodObjectNode) => {
          // Get all methods name
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
              children.push(new PageObjectTreeNode(typeValue, []));
            }
          }
        });
      }

      // For root Page Object
      const rootMarkerNode = findNodeAtLocation(rootNode, ['root']);
      if (rootMarkerNode !== undefined && rootMarkerNode.value === true) {
        const rootNode = new PageObjectTreeNode(pageObjectName, methods, children);
        if (!this.rootMap.has(pageObjectName)) {
          this.rootMap.set(pageObjectName, rootNode);
        }
      } else {
        // For non-root Page Object
        const childNode = new PageObjectTreeNode(pageObjectName, methods, children);
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
  }

  getMap () {
    return this.rootMap;
  }
}