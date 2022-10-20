import { lstatSync, readdirSync, readFileSync } from 'fs';
import { join, basename } from 'path';
import { UTAM_EXT } from 'utam/build/utils/constants';
import { _ } from 'lodash';

export default class PageObjectPackageParser {
  constructor (packagePath, isIOS) {
    this.isIOS = isIOS;
    this.packageDir = packagePath;
    this.treeMap = new Map();
  }

  buildTreeMap () {
    const modules = readdirSync(this.packageDir);
    modules.forEach((module) => {
      let files;
      const modulePath = join(this.packageDir, module);
      if (lstatSync(modulePath).isDirectory()) {
        files = readdirSync(modulePath);
        files.forEach((file) => {
          this.buildTreeMapFromFile(file, join(modulePath, file));
        });
      } else {
        const file = module;
        this.buildTreeMapFromFile(file, modulePath);
      }
    });

    // Post processing to handle returntype of each method
    for (let poName of this.treeMap.keys()) {
      let po = this.treeMap.get(poName);
      if (!po.methods) {
        continue;
      }

      for (let methodName of Object.keys(po.methods)) {
        let method = po.methods[methodName];
        // Check if the return type is a PO
        if (method.returnType && _.isString(method.returnType) && method.returnType.includes('/')) {
          let childName = method.returnType.split('/').pop();
          let childPO = this.treeMap.get(childName);
          if (childPO.methods) {
            // Update the returnType of the method as it is a PO
            method.returnType = {name: childName, methods: {}};
            for (let childMethodName of Object.keys(childPO.methods)) {
              method.returnType.methods[childMethodName] = {};

              // Populate the list of arguments of the method like (a, b, c)
              let arglist = '()';
              if (childPO.methods[childMethodName].args) {
                method.returnType.methods[childMethodName].args = childPO.methods[childMethodName].args;
                arglist = '(' + childPO.methods[childMethodName].args.map((a) => a.name).join(',') + ')';
              }

              method.returnType.methods[childMethodName].Java_Code = method.Java_Code + '.' + childMethodName + arglist;
              method.returnType.methods[childMethodName].JS_Code = method.JS_Code + '.' + childMethodName + arglist;
            }
          }
        }
      }
      this.treeMap.set(poName, po);
    }
  }

  // Build the tree map from Page Object json file
  buildTreeMapFromFile (file, filePath) {
    if (file.includes(UTAM_EXT)) {
      let [pageObjectName] = basename(filePath).split('.');

      if (pageObjectName.endsWith('Android')) {
        if (this.isIOS) {
          // Skip android file processing
          return;
        }
        pageObjectName = pageObjectName.slice(0, -7);
      } else if (pageObjectName.endsWith('iOS')) {
        if (!this.isIOS) {
          // Skip ios file processing
          return;
        }
        pageObjectName = pageObjectName.slice(0, -3);
      }

      const sourceText = readFileSync(filePath, 'utf8');
      let temp = JSON.parse(sourceText);
      if (!temp.interface && !temp.implements) {
        // Skip if not an interface file nor implement file
        return;
      }

      let po = this.treeMap.get(pageObjectName) || {name: pageObjectName};

      // this is a root PO
      if (temp.root === true) {
        po.root = true;
      }

      // handle implements (android/ios) file
      if (temp.implements) {
        if (temp.elements) {
          po.elements = temp.elements;
        }
        if (temp.selector) {
          po.selector = temp.selector;
        }
      }

      // handle interface file
      if (temp.interface) {
        if (!po.methods && temp.methods) {
          po.methods = {};

          for (let method of temp.methods) {
            po.methods[method.name] = {};

            // Populate the list of arguments of the method like (a, b, c)
            let arglist = '()';
            if (method.args) {
              po.methods[method.name].args = method.args;
              arglist = '(' + po.methods[method.name].args.map((a) => a.name).join(',') + ')';
            }

            po.methods[method.name].Java_Code = 'loader.load(' + pageObjectName + '.class)' + '.' + method.name + arglist;
            po.methods[method.name].JS_Code = 'await utam.load(' + pageObjectName + ').' + method.name + arglist;

            if (method.returnType) {
              po.methods[method.name].returnType = method.returnType;
            }
          }
        }
      }
      this.treeMap.set(pageObjectName, po);
    }
  }

  getMap () {
    return this.treeMap;
  }
}