import React from 'react'
import {Link} from 'react-router-dom'

class EditableComponent extends React.Component {
  constructor (props) {
    super(props)
  }

  render () {
    return (
      <div>
        {/* <button type='button' onClick={() => this.props.editable()}>Edit</button> */}
        {this.props.isEditable
          ? <div>
            <textarea name={this.props.type} onChange={this.props.handleChange} placeholder={this.props.content}/>
            <Link to='/grad-profile'><button onClick={() => this.props.addGradProfile()}>Save Changes
            </button></Link>
          </div>
          : <p>{this.props.content}</p>
        }
      </div>
    )
  }
}

export default EditableComponent