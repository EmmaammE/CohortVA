/* eslint-disable */

import React from 'react';
import './tooltip.css';
import ListItem from '../selectList/ListItem'

class Tip extends React.Component{
  constructor(props){
    super(props)
    this.state={

    }
    this.$container = React.createRef()
  }

  render(){
    let data = this.props.data
    let title = this.props.title
    let style = this.props.style
    let dWidth = document.body.clientWidth
    let dHeight = document.body.clientHeight
    // 以下进行弹窗的溢出的修正
    if(style.left){
      if(style.left+160>dWidth){
        style.left-=160
      }else{
        style = {...style,left:style.left+10}
      }
      if(style.top+150>dHeight){
        style.top-=150
      }
    }
    let tipHasX = true
    let handleClickX = this.props.handleClickX
    return(
      <div 
        className="tooltip-box"
        style={style}
        ref = {this.$container}
      >
        <div className="tooltip-head">
          <div className="tooltip-head-title">
            {title}
          </div>
          {
            tipHasX?
            <div className="tooltip-head-close"
              onClick = {handleClickX}
            >
              X
            </div>
            :null
          }
          
        </div>
        <div className="tooltip-content"> 
          {
            data && data.length===1?<div>{data[0]}</div>
            :data && data.map((v,i)=>(
              <ListItem 
                data={i+1+'. '+v}
                key={`ListItem${i}`}
              ></ListItem>
             )
            )
          }
        </div>
      </div>
    )
  }
}




export default Tip;