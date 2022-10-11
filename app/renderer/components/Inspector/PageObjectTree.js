import InspectorStyles from './Inspector.css';
import PageObjectPacakgeParser from './PageObjectPackageParser';
import Path from 'path';
import React, { Component } from 'react';
import { Button, Col, Form, Input, Row, Spin } from 'antd';
import { SelectOutlined } from '@ant-design/icons';
import Tree from './Tree';
const FormItem = Form.Item;

export default class PageObjectTree extends Component {
  constructor (props) {
    super(props);
    this.state = {
      items: [],
      text: '',
      package: '',
      version: '',
      module: ''
    };

    this.handlePackageNameChange = this.handlePackageNameChange.bind(this);
    this.handlePackageVersionChange = this.handlePackageVersionChange.bind(this);
    this.handleModuleChange = this.handleModuleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleFindPO = this.handleFindPO.bind(this);
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
    const { inspectPageObject, resetSearchForPORootElement } = this.props;
    inspectPageObject(this.state.package, this.state.version, this.state.module);
    resetSearchForPORootElement();
    event.preventDefault();
  }

  handleFindPO (event) {
    const {driver, pageObjectTreeData, resetSearchForPORootElement, searchForPORootElement } = this.props;
    const {isIOS, isAndroid} = driver.client;
    const strategyMap = {
      'accessid': 'accessibility id',
      'css': 'css',
      'id': 'id',
      'name': 'name',
      'className': 'class name',
      'uiautomator': '-android uiautomator',
      'classchain': '-ios class chain',
    };

    resetSearchForPORootElement();

    for (let po of pageObjectTreeData) {
      let t = strategyMap[po.children.rootSelector.type];

      let id = isIOS ? po.children.rootSelector.ios : po.children.rootSelector.android;
      if (isIOS) {
        if (t.includes('automator')) {
          continue;
        }
      }

      if (isAndroid) {
        if (t.includes('classchain')) {
          continue;
        }
      }

      searchForPORootElement(t, id, po);
    }

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
                <Button icon={<SelectOutlined/>} onClick={this.handleSubmit} >{t('startInspect')}</Button>
              </FormItem>
            </Col>
            <Col span={4}>
              <FormItem>
                <Button icon={<SelectOutlined/>} onClick={this.handleFindPO} >{t('findCurrentPO')}</Button>
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
  const util = require('util');
  const exec = util.promisify(require('child_process').exec);
  if (packageName.size !== 0 && packageVersion.size !== 0 && moduleName.size !== 0) {
    await exec(`npm install ${packageName}@${packageVersion}`);
    const appDir = process.cwd();
    const packageDir = Path.join(appDir, `/node_modules/${packageName}/dist/${moduleName}`);
    const poPackageParser = new PageObjectPacakgeParser(packageDir);
    // Twice build will take care there is no root Page Object for non-root Page Object
    // When the target root Page Object not build up yet in the first build
    poPackageParser.buildTreeMap();
    poPackageParser.buildTreeMap();
    const treeMap = poPackageParser.getMap();
    return Array.from(treeMap, ([root, children]) => ({ root, children }));
  }
}
