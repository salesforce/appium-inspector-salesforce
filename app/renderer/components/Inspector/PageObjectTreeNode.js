export default class PageObjectTreeNode {
  constructor (name, rootSelector, methods, children) {
    // string
    this.name = name;
    // string arrary
    this.methods = methods;
    // PageObjectTreeNode arrary
    this.children = children;
    // {ios: '', android: ''} object
    this.rootSelector = rootSelector;
  }
}