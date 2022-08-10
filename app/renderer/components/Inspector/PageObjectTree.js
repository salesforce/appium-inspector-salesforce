import InspectorStyles from './Inspector.css';
import PageObjectPacakgeParser from './PageObjectPackageParser';
import Path from 'path';
import React, { Component, useState } from 'react';

export default class PageObjectTree extends Component {
  constructor (props) {
    super(props);
    this.ChildrenList = new Map();
    this.treeData = this.buildTreeData();
    this.state = { items: [], text: ''};
  }

  render () {
    return (
      <div className={InspectorStyles['tree-container']}>
        <h1>Salesforce App Page Objects</h1>
        <Tree treeData={this.treeData} />
      </div>
    );
  }

  buildTreeData () {
    const appDir = process.cwd();
    const packageDir = Path.join(appDir, '/node_modules/salesforce-pageobjects/dist/salesforceapp');
    const poPackageParser = new PageObjectPacakgeParser(packageDir);
    poPackageParser.buildRootMap();
    const rootMap = poPackageParser.getMap();
    rootMap.forEach((value, key) => {
      this.addRootAndChild(key, value);
    });
    return Array.from(this.ChildrenList, ([root, children]) => ({ root, children }));
  }

  addRootAndChild (root, child) {
    if (!this.ChildrenList.has(root)) {
      this.ChildrenList.set(root, []);
    }
    let children = this.ChildrenList.get(root);
    children = children.concat(child);
    this.ChildrenList.set(root, children);
  }
}

function Tree ({ treeData }) {
  return (
    <ul>
      {treeData.map((node) => (
        <TreeNode node={node} key={node.root}/>
      ))}
    </ul>
  );
}

function TreeNode ({ node }) {
  const label = node.root;
  const children = node.children;

  const [showChildren, setShowChildren] = useState(false);

  const handleClick = () => {
    setShowChildren(!showChildren);
  };
  return (
    <>
      <div onClick={handleClick} style={{ marginBottom: '10px',  marginTop: '10px', fontSize: '20px'}}>
        <li>{label}</li>
      </div>
      <div>
        <ul style={{ paddingLeft: '10px'}}>
          {showChildren && children.map((child) => <li style={{ listStyleType: 'none', marginBottom: '5px', paddingLeft: '10px', fontSize: '15px'}}> {child} </li>)}
        </ul>
      </div>
    </>
  );
}