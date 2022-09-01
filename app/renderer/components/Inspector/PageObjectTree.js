import InspectorStyles from './Inspector.css';
import PageObjectPacakgeParser from './PageObjectPackageParser';
import Path from 'path';
import React, { Component, useState } from 'react';
import { Button, Col, Form, Input, Row, Spin } from 'antd';
import { SelectOutlined } from '@ant-design/icons';

const FormItem = Form.Item;

export default class PageObjectTree extends Component {
  constructor (props) {
    super(props);
    this.state = {
      items: [],
      //treeData: [],
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
    const { inspectPageObject } = this.props;
    inspectPageObject(this.state.package, this.state.version, this.state.module);
    event.preventDefault();
  }

  render () {
    const { t, isPageObjectInspectInProgress, pageObjectTreeData, errorMsg } = this.props;

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
        <Spin size="large" spinning={!!isPageObjectInspectInProgress}>
          <Tree treeData={pageObjectTreeData}/>
          <span>{errorMsg}</span>
        </Spin>
      </div>
    );
  }
}

export async function buildTreeData (packageName, packageVersion, moduleName) {
  const ChildrenList = new Map();
  const util = require('util');
  const exec = util.promisify(require('child_process').exec);
  if (packageName.size !== 0 && packageVersion.size !== 0 && moduleName.size !== 0) {
    await exec(`npm install ${packageName}@${packageVersion}`);
    const appDir = process.cwd();
    const packageDir = Path.join(appDir, `/node_modules/${packageName}/dist/${moduleName}`);
    const poPackageParser = new PageObjectPacakgeParser(packageDir);
    poPackageParser.buildRootMap();
    const rootMap = poPackageParser.getMap();
    (function (ChildrenList) {
      rootMap.forEach((child, root) => {
        if (!ChildrenList.has(root)) {
          ChildrenList.set(root, []);
        }
        let children = ChildrenList.get(root);
        children = children.concat(child);
        ChildrenList.set(root, children);
      });
    })(ChildrenList);
    return Array.from(ChildrenList, ([root, children]) => ({ root, children }));
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