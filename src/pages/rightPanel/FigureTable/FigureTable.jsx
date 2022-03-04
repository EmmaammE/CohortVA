/* eslint-disable  */
import React, { Component, useReducer, useState, useEffect } from 'react';
import 'antd/lib/collapse/style/index.css';
import './figureTable.css';
import { Collapse } from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';
import { get } from '../../../api/tools';
const { Panel } = Collapse;

const FigureTable = ({ chosenFigure }) => {
  const [figure, setFigure] = useState({});
  const [loading, setLoading] = useState(false);

  const isValid = (data) => {
    if (
      data === '未知' ||
      data === '0' ||
      data === '未詳' ||
      data === undefined ||
      data === '' ||
      data === ' '
    )
      return false;
    return true;
  };
  const replaceY = (data, replaceName) =>
    String.prototype.replace.call(data, 'Y', replaceName);
  useEffect(() => {
    if (chosenFigure && chosenFigure!=='') {
      const queryString = 
        // chosenFigure
        chosenFigure.indexOf('(') === -1
          ? chosenFigure
          : chosenFigure.substring(0, chosenFigure.indexOf('('));
      const settings = {
        url: `https://cbdb.fas.harvard.edu/cbdbapi/person.php?o=json&name=${queryString}`,
        // url: `https://cbdb.fas.harvard.edu/cbdbapi/person.php?o=json&id=${queryString}`, 
      };
      setLoading(true);
      get(settings).then((res) => {
        if (!res.data.Package) {
          alert('这个人的资料有问题。');
          return;
        }
        const figure = Array.isArray(
          res.data.Package.PersonAuthority.PersonInfo.Person
        )
          ? res.data.Package.PersonAuthority.PersonInfo.Person[0]
          : res.data.Package.PersonAuthority.PersonInfo.Person;
        if (!figure) return;
        const showFigure = {
          'Personal Info': isValid(figure.BasicInfo)
            ? {
                'Name': figure.BasicInfo.ChName,
                'English Name': figure.BasicInfo.EngName,
                'Birth Year': figure.BasicInfo.YearBirth,
                'Birth Era': figure.BasicInfo.EraBirth,
                'Death Year': figure.BasicInfo.YearDeath,
                'Birth Place': figure.BasicInfo.JunWang,
              }
            : {},
          'Appointment of Official': isValid(figure.PersonPostings)
            ? {
                'Office Name': figure.PersonPostings.Posting.OfficeName,
                'First Year': figure.PersonPostings.Posting.FirstYear,
                'Last Year': figure.PersonPostings.Posting.LastYear,
              }
            : {},
          'Social Status ': isValid(figure.PersonSocialStatus)
            ? Array.isArray(figure.PersonSocialStatus.SocialStatus)
              ? figure.PersonSocialStatus.SocialStatus.map((item) => ({
                  'Status Name': item.StatusName,
                  'First Year': item.FirstYear,
                  'Last Year': item.LastYear,
                }))
              : {
                  'Status Name':
                    figure.PersonSocialStatus.SocialStatus.StatusName,
                  'First Year':
                    figure.PersonSocialStatus.SocialStatus.FirstYear,
                  'Last Year': figure.PersonSocialStatus.SocialStatus.LastYear,
                }
            : {},
          'Kinship Info': isValid(figure.PersonKinshipInfo)
            ? Array.isArray(figure.PersonKinshipInfo.Kinship)
              ? figure.PersonKinshipInfo.Kinship.map((item) => ({
                  'Kin Person Name': item.KinPersonName,
                  'Kin Rel Name': item.KinRelName,
                }))
              : {
                  'Kin Person Name':
                    figure.PersonKinshipInfo.Kinship.KinPersonName,
                  'Kin Rel Name': figure.PersonKinshipInfo.Kinship.KinRelName,
                }
            : {},
          'Social Relations': isValid(figure.PersonSocialAssociation)
            ? Array.isArray(figure.PersonSocialAssociation.Association)
              ? figure.PersonSocialAssociation.Association.map((item) => ({
                  'Assoc Person Name': item.AssocPersonName,
                  'Assoc Name': replaceY(
                    item.AssocName,
                    figure.BasicInfo.ChName
                  ),
                }))
              : {
                  'Assoc Person Name':
                    figure.PersonSocialAssociation.Association.AssocPersonName,
                  'Assoc Name': replaceY(
                    figure.PersonSocialAssociation.Association.AssocName,
                    figure.BasicInfo.ChName
                  ),
                }
            : {},
        };
        setFigure({ ...showFigure });
        setLoading(false)
        // setActiveId([0])
      });
    }
    // else {
    //     const figure = person.Package.PersonAuthority.PersonInfo.Person;
    //     const showFigure = {
    //         '个人信息': isValid(figure.BasicInfo)?
    //         {
    //             "English Name": figure.BasicInfo.EngName,
    //             "Birth Year": figure.BasicInfo.YearBirth,
    //             "Birth Era": figure.BasicInfo.EraBirth,
    //             "Death Year": figure.BasicInfo.YearDeath,
    //             "Birth Place":figure.BasicInfo.JunWang
    //         }:{},
    //         '任官': isValid(figure.PersonPostings)?{
    //             "Office Name": figure.PersonPostings.Posting.OfficeName,
    //             "First Year": figure.PersonPostings.Posting.FirstYear,
    //             "Last Year":figure.PersonPostings.Posting.LastYear,
    //         }:{},
    //         '社会区分': isValid(figure.PersonSocialStatus) ? Array.isArray(figure.PersonSocialStatus.SocialStatus) ?
    //             figure.PersonSocialStatus.SocialStatus.map(item => {
    //                 return {
    //                     "Status Name": item.StatusName,
    //                     "First Year":item.FirstYear,
    //                     "Last Year":item.LastYear,
    //                 }
    //             }) : {
    //                 "Status Name": figure.PersonSocialStatus.SocialStatus.StatusName,
    //                 "First Year":figure.PersonSocialStatus.SocialStatus.FirstYear,
    //                 "Last Year":figure.PersonSocialStatus.SocialStatus.LastYear,
    //             }:{},
    //         '亲属关系': isValid(figure.PersonKinshipInfo) ? Array.isArray(figure.PersonKinshipInfo.Kinship) ?
    //             figure.PersonKinshipInfo.Kinship.map(item => {
    //             return {
    //                 "Kin Person Name": item.KinPersonName,
    //                 "Kin Rel Name": item.KinRelName
    //             }
    //         }):  {
    //             "Kin Person Name": figure.PersonKinshipInfo.Kinship.KinPersonName,
    //             "Kin Rel Name": figure.PersonKinshipInfo.Kinship.KinRelName
    //         }  :{},
    //         '社会关系': isValid(figure.PersonSocialAssociation) ? Array.isArray(figure.PersonSocialAssociation.Association)?
    //             figure.PersonSocialAssociation.Association.map(item => {
    //             return {
    //                 "Assoc Person Name": item.AssocPersonName,
    //                 "Assoc Name": replaceY(item.AssocName,figure.BasicInfo.ChName)
    //                 }
    //             }) : {
    //                 "Assoc Person Name": figure.PersonSocialAssociation.Association.AssocPersonName,
    //                 "Assoc Name": replaceY(figure.PersonSocialAssociation.Association.AssocName
    //                     , figure.BasicInfo.ChName)
    //             } : {}
    //     }
    //     setFigure({...showFigure} );
    // }
  }, [chosenFigure]);
  return (
    <div className="figure-table-container mod g-scroll">
      {loading && <div className='loading-border'></div>}
      <div className="figure-detail-list">
        {figure['Personal Info'] ? (
          <div className="basic-info">
            <p className="title">Personal Info</p>
            <p className="basic-info-panel">
              {Object.keys(figure['Personal Info']).map((param) => (
                <li key={param}>
                  {' '}
                  <span className="param">{param}</span>
                  <span className="value">
                    {figure['Personal Info'][param]}{' '}
                  </span>
                </li>
              ))}
            </p>
          </div>
        ) : (
          <></>
        )}

        <Collapse
          bordered={false}
          className="site-collapse-custom-collapse"
          expandIconPosition="right"
          expandIcon={() => (
            <CaretRightOutlined rotate={270} style={{ color: '#CECECE' }} />
          )}
        >
          {figure ? (
            Object.keys(figure).map((key, idx) => {
              if (key === 'Personal Info') return <></>;
              return (
                <Panel
                  header={key}
                  className="site-collapse-custom-panel"
                  collapsible="header"
                  key={idx}
                >
                  <ul>
                    {Array.isArray(figure[key])
                      ? figure[key].map((item) => (
                          <div className="group">
                            {Object.keys(item).map((param) => {
                              if (isValid(item[param]))
                                return (
                                  <li>
                                    <span className="param">{param}</span>
                                    <span className="value">{item[param]}</span>
                                  </li>
                                );
                            })}
                          </div>
                        ))
                      : Object.keys(figure[key]).map((param) => {
                          if (figure[key][param])
                            return (
                              <li>
                                {' '}
                                <span className="param">{param}</span>
                                <span className="value">
                                  {' '}
                                  {figure[key][param]}{' '}
                                </span>
                              </li>
                            );
                        })}
                  </ul>
                </Panel>
              );
            })
          ) : (
            <></>
          )}
        </Collapse>
      </div>
    </div>
  );
};

export default FigureTable;
