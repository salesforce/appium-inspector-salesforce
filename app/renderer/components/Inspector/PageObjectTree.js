import InspectorStyles from './Inspector.css';
import PageObjectPacakgeParser from './PageObjectPackageParser';
import Path from 'path';
import React, { Component, useState } from 'react';
import { Button, Col, Form, Input, Row } from 'antd';
import { SelectOutlined } from '@ant-design/icons';

const FormItem = Form.Item;

export default class PageObjectTree extends Component {
  constructor (props) {
    super(props);
    this.ChildrenList = new Map();
    this.state = {
      items: [],
      treeData: [],
      text: '',
      package: '',
      version: '',
      module: ''
    };

    this.handlePackageNameChange = this.handlePackageNameChange.bind(this);
    this.handlePackageVersionChange = this.handlePackageVersionChange.bind(this);
    this.handleModuleChange = this.handleModuleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleModuleChange (event) {
    this.setState({module: event.target.value});
  }

  handlePackageNameChange (event) {
    this.setState({package: event.target.value});
  }

  handlePackageVersionChange (event) {
    this.setState({version: event.target.value});
  }

  handleSubmit (event) {
    this.setState({treeData: this.buildTreeData()});
    event.preventDefault();
  }

  render () {
    const { t } = this.props;

    return (
      <div className={InspectorStyles['tree-container']}>
        <Form>
          <Row gutter={8}>
            <Col span={12}>
              <FormItem>
                <Input
                  type='text'
                  addonBefore={t('utamPageObjectPackageName')}
                  placeholder='fake-pageobjects'
                  value={this.state.package}
                  onChange={this.handlePackageNameChange} />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem>
                <Input
                  type='text'
                  addonBefore={t('utamPageObjectPackageVersion')}
                  placeholder='1.0.0'
                  value={this.state.version}
                  onChange={this.handlePackageVersionChange} />
              </FormItem>
            </Col>
          </Row>
          <Row gutter={8}>
            <Col span={12}>
              <FormItem>
                <Input
                  type='text'
                  addonBefore={t('utamPageObjectModuleName')}
                  placeholder='fakeapp'
                  value={this.state.module}
                  onChange={this.handleModuleChange} />
              </FormItem>
            </Col>
            <Col span={4}>
              <FormItem>
                <Button icon={<SelectOutlined/>} onClick={this.handleSubmit}>{t('startInspect')}</Button>
              </FormItem>
            </Col>
          </Row>
        </Form>
        <Tree treeData={this.state.treeData}/>
      </div>
    );
  }

  addRootAndChild (root, child) {
    if (!this.ChildrenList.has(root)) {
      this.ChildrenList.set(root, []);
    }
    let children = this.ChildrenList.get(root);
    children = children.concat(child);
    this.ChildrenList.set(root, children);
  }

  buildTreeData () {
    const packageName = this.state.package;
    const moduleName = this.state.module;
    const packageVersion = this.state.version;
    this.ChildrenList = new Map();
    const child_process = require('child_process');
    try {
      //child_process.execSync(`npm uninstall ${packageName}`);
      child_process.execSync(`npm install ${packageName}@${packageVersion}`);
      // eslint-disable-next-line no-console
      console.log(`Succeed to install package: ${packageName} with version: ${packageVersion}`);
    } catch (ex) {
      // eslint-disable-next-line no-console
      console.log(`Fail to install package for ${ex.stdout}`);
    }
    const appDir = process.cwd();
    const packageDir = Path.join(appDir, `/node_modules/${packageName}/dist/${moduleName}`);
    const poPackageParser = new PageObjectPacakgeParser(packageDir);
    poPackageParser.buildRootMap();
    const rootMap = poPackageParser.getMap();
    rootMap.forEach((value, key) => {
      this.addRootAndChild(key, value);
    });
    return Array.from(this.ChildrenList, ([root, children]) => ({ root, children }));
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