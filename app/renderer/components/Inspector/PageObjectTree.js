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
      module: '',
      package: '',
      path: '',
      version: 'latest',
      text: ''
    };

    this.handleModuleChange = this.handleModuleChange.bind(this);
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handlePathChange = this.handlePathChange.bind(this);
    this.handleVersionTagChange = this.handleVersionTagChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleFindPO = this.handleFindPO.bind(this);
  }

  handleModuleChange (event) {
    this.setState({module: event.target.value});
  }

  handleNameChange (event) {
    this.setState({package: event.target.value});
  }

  handleVersionTagChange (event) {
    this.setState({version: event.target.value});
  }

  handlePathChange (event) {
    this.setState({path: event.target.value});
  }

  handleSubmit (event) {
    const { driver, inspectPageObject, resetSearchForCurrentPOs } = this.props;
    const { isIOS } = driver.client;
    inspectPageObject(
      this.state.package,
      this.state.module,
      this.state.version,
      this.state.path,
      isIOS);
    resetSearchForCurrentPOs();
    event.preventDefault();
  }

  handleFindPO (event) {
    const { pageObjectTreeData, searchForCurrentPOs} = this.props;
    searchForCurrentPOs(pageObjectTreeData);
    event.preventDefault();
  }

  render () {
    const { t, isPageObjectInspectInProgress, pageObjectTreeData, errorMsg } = this.props;

    return (
      <div className={InspectorStyles['tree-container']}>
        <Form>
          <Row gutter={8}>
            <Col span={20}>
              <FormItem>
                <Input
                  type='text'
                  addonBefore={t('utamPageObjectModuleName')}
                  placeholder='fakeapp'
                  value={this.state.module}
                  onChange={this.handleModuleChange} />
              </FormItem>
            </Col>
          </Row>
          <Row gutter={8}>
            <Col span={20}>
              <FormItem>
                <Input
                  type='text'
                  addonBefore={t('utamPageObjectFullPath')}
                  placeholder='full path'
                  value={this.state.path}
                  onChange={this.handlePathChange} />
              </FormItem>
            </Col>
          </Row>
          <Row gutter={8}>
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

export function buildTreeData (
  moduleName,
  packagePath,
  isIOS) {
  if (moduleName.length !== 0 ||
       packagePath.length !== 0) {
    let packageDir = '';
    if (moduleName.length !== 0) {
      packageDir = Path.join(packagePath, `package/dist/${moduleName}`);
    }
    const poPackageParser = new PageObjectPacakgeParser(packageDir, isIOS);
    poPackageParser.buildTreeMap();
    const treeMap = poPackageParser.getMap();
    return Array.from(treeMap, ([name, children]) => (children));
  } else {
    throw new Error(`There is no information supplied for the Page Object package. You have to either supply the Page Object npm package information (name, version and module name) or package full path that you have in your local.`);
  }
}
