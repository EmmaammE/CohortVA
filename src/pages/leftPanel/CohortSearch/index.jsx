/* eslint-disable */
import React from 'react';
import { Divider, Input, Select } from 'antd';
import 'antd/lib/divider/style/index.css';
import 'antd/lib/select/style/index.css';
import { ReactComponent as SearchICON } from '../../../assets/icons/search.svg';
import './index.scss';

// to do 找思危要下对应关系 搜索condition时输入框上面展示的搜索项名字
const defaultOptionsMap = {
  Dynasty: 'dynasty_ids[]',
  Status: 'status_ids[]',
  Addr: 'address_ids[]',
  PostType: 'post_type_ids[]',
  Office: 'office_ids[]',
  OfficeType: 'office_type_ids[]',
  // '': 'Native Place',
  // '': 'Holding Post',
  post_address: 'post_address_ids[]',
  // '': 'Official Position',
  Entry: 'entry_ids[]',
  EntryType: 'entry_type_ids[]',
};

const { Option } = Select;

const SearchSVG = (props) => {
  return (
    <span {...props}>
      <SearchICON />
    </span>
  );
};

class CohortSearcherPanel extends React.PureComponent {
  constructor() {
    super();
    this.state = {
      searchMode: '', // 三种方式 分别对应figure、condition、regex
    };
    this.displayInput = this.displayInput.bind(this);
    this.submit = this.submit.bind(this);
    this.selectItems = {};
  }

  // 显示相应的输入框
  displayInput(e) {
    const targetElement = e.currentTarget;
    this.setState({
      searchMode: targetElement.parentNode.id,
    });
  }

  // 改变当前的selectItems
  onSelectChange(key, value) {
    const resultV = value.map((v) => Number(v.split('+')[1]));
    console.log(key, value, resultV);
    this.selectItems[key] = [...resultV];
  }

  // 提交输入，进行群体搜索
  submit() {
    const { searchMode } = this.state;
    const {
      onSubmitCondition,
      onSubmitRegex,
      onSubmitName,
      onSubmitFigureNames,
    } = this.props;
    const { searcherOptions = {} } = this.props;
    const optionsList = Object.keys(searcherOptions);

    // to do
    // 1. 搜索框的高亮以及词语提示
    // 2. 正则输入的解析
    // 3. Figure栏的搜索(好像不用做？)

    switch (searchMode) {
      case 'figure':
        // 获取输入框的内容
        const _query = {};
        const { value } = document.getElementById('figure-name-input');
        if (value !== '' && value)
          if (value.indexOf(';') > 0) _query.name = value.split(';');
          else if (value.indexOf('；') > 0) _query.name = value.split('；');
          else _query.name = [value];
        if (JSON.stringify(_query) === '{}') {
          alert('Please input first!');
        } else {
          console.log('Search by figure names', _query);
          onSubmitName(_query);
        }
        break;
      case 'figure_names':
        // 获取输入框的内容
        const param = {};
        const value2 = document.getElementById('figure-name-list-input').value;
        if (value2 !== '' && value2)
          if (value2.indexOf(';') > 0) param.pnames = value2.split(';');
          else param.pnames = value2.split('；');
        if (JSON.stringify(param) === '{}') {
          alert('Please input first!');
        } else {
          console.log('Search by figure collection names', param);
          onSubmitFigureNames(param);
        }
        break;
      case 'condition':
        // 获取输入框的内容
        const query = {};
        optionsList.forEach((option) => {
          if (this.selectItems[option])
            query[defaultOptionsMap[option]] = this.selectItems[option];
          // const targetDiv = document.getElementById(`condition-input-${option}`);
          // if (targetDiv) {
          //   const inputValue = targetDiv.getElementsByTagName('input')[0].value;
          //   if (inputValue !== '') {
          //     query[option] = inputValue;
          //     console.log(inputValue)
          //   }
          // }
        });
        if (JSON.stringify(query) === '{}') {
          alert('Please input first!');
        } else {
          console.log('Search by condition', query);
          onSubmitCondition(query);
        }
        break;
      case 'regex':
        console.log('Search by regex');
        // to do 正则输入的解析
        // 暂时使用假数据测试
        onSubmitRegex({
          features: {
            1: {
              model_descriptors: [
                {
                  type: 'place_model',
                  parms: {
                    place: 445657,
                  },
                },
              ],
              weight: 1,
            },
            2: {
              model_descriptors: [
                {
                  type: 'time_model',
                  parms: {
                    range: [621431, 1403],
                  },
                  not: false,
                },
              ],
              weight: 1,
            },
            3: {
              model_descriptors: [
                {
                  type: 'group_model',
                  parms: {
                    associations: [951603],
                  },
                },
              ],
              weight: 1,
            },
          },
          use_weight: false,
        });
        break;
      default:
        break;
    }
  }

  render() {
    const { searchMode } = this.state;
    const { searcherOptions = {} } = this.props;
    const optionsList = Object.keys(searcherOptions);

    return (
      <div id="searcher-panel" className="visual-panel">
        <div className="searcher-items">
          <div className="searcher-item" id="figure_names">
            Figures
            <SearchSVG onClick={this.displayInput} />
          </div>
          {searchMode === 'figure_names' && (
            <Input id="figure-name-list-input" className="his-input" />
          )}
          <div className="searcher-item" id="figure">
            Ego-network
            <SearchSVG onClick={this.displayInput} />
          </div>
          {searchMode === 'figure' && (
            <Input id="figure-name-input" className="his-input" />
          )}
          <div className="searcher-item" id="condition">
            Condition
            <SearchSVG onClick={this.displayInput} />
          </div>
          {searchMode === 'condition' && (
            <div id="condition-list">
              {optionsList.map((option, i) =>
                option === 'is_success' ? null : (
                  <div key={`option-${i}`} id={`condition-input-${option}`}>
                    <Divider>{option}</Divider>
                    {/* 这里用来改变condition里面的input为drawdown */}
                    <Select
                      mode="multiple"
                      placeholder="Please select"
                      className="custom-select"
                      onChange={(value) => this.onSelectChange(option, value)}
                    >
                      {Object.keys(searcherOptions[option]).map(
                        (opt_key, i) => {
                          const value =
                            searcherOptions[option][opt_key].en_name;
                          return (
                            <Option key={opt_key} value={`${value}+${opt_key}`}>
                              {value}
                            </Option>
                          );
                        }
                      )}
                    </Select>
                    {/* <Input/> */}
                  </div>
                )
              )}
            </div>
          )}
          <div className="searcher-item" id="regex">
            Concept Language
            <SearchSVG onClick={this.displayInput} />
          </div>
          {searchMode === 'regex' && <Input className="his-input" />}
          <div className="searcher-item">Model Selection</div>
          <div id="model-checkbox">
            {/* 写死 */}
            {['office', 'group', 'popular', 'time', 'location', 'frequent'].map(
              (f, i) => (
                <div className="single-checkbox" style={{}} key={i}>
                  <input type="checkbox" value="group" checked readOnly />
                  <label>{f}</label>
                  <div className="split-line" />
                </div>
              )
            )}
            <div id="placer" />
            <div id="submit-button" onClick={this.submit}>
              Search
            </div>
          </div>
          <div id="submit-button" onClick={this.submit}>
            Search
          </div>
        </div>
      </div>
    );
  }
}

export default CohortSearcherPanel;

// const mapStateToProps = (state) =>
//   // console.log('mapStateToProps', state.searcherOptions)
//    ({
//     searcherOptions: state.searcherOptions // 从后端拿到的condition搜索的option list
//   })
// ;

// const mapDispatchToProps = (dispatch) => ({
//     onSubmitCondition: (config) => {
//       dispatch(getCohortByRanges(config));
//     },
//     onSubmitRegex: (config) => {
//       dispatch(getCohortByRegex(config));
//     },
//     onSubmitName: (config) => {
//       dispatch(getCohortByName(config));
//     },
//     onSubmitFigureNames: (config) => {
//       dispatch(getCohortByFigureNames(config));
//     },
//   })

// export default connect(
//   mapStateToProps,
//   mapDispatchToProps
// )(CohortSearcherPanel);
