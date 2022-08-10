import { lstatSync, readdirSync, readFileSync } from 'fs';
import { findNodeAtLocation, getNodeValue, parseTree } from 'jsonc-parser';
import { isCustomType } from '@utam/compiler/build/utils/element-types';
import { join, basename } from 'path';
import { UTAM_EXT } from 'utam/build/utils/constants';

export default class PageObjectPackageParser {
  constructor (packagePath) {
    this.packageDir = packagePath;
    this.rootMap = new Map();
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
      const rootMarkerNode = findNodeAtLocation(rootNode, ['root']);
      const methodsNode = findNodeAtLocation(rootNode, ['methods']);
      // For root Page Object, set a blank arrary for its children
      if (rootMarkerNode !== undefined && rootMarkerNode.value === true) {
        this.rootMap.set(pageObjectName, []);
      }
      // For non-root Page Object
      if (methodsNode !== undefined && methodsNode.children) {
        methodsNode.children.forEach((methodObjectNode) => {
          const returnTypeNode = findNodeAtLocation(methodObjectNode, ['returnType']);
          if (returnTypeNode) {
            const returnTypeNodeValue = getNodeValue(returnTypeNode);
            if (isCustomType(returnTypeNodeValue)) {
              const typeValue = returnTypeNodeValue.split('/').pop();
              this.rootMap.has(pageObjectName) ?
                this.rootMap.get(pageObjectName).push(typeValue) :
                this.rootMap.set(pageObjectName).push(typeValue);
            }
          }
        });
      }
    }
  }

  getMap () {
    return this.rootMap;
  }
}