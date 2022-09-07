export default class PageObjectTreeNode {
  constructor (name, methods, children) {
    // string
    this.name = name;
    // string arrary
    this.methods = methods;
    // PageObjectTreeNode arrary
    this.children = children;
  }
}