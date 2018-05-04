import React from 'react'
import { Modal, Button } from 'react-bootstrap';

export default class AboutDialogComponent extends React.PureComponent{

    constructor(props) {
        super(props);
        this.handleCancel = this.handleCancel.bind(this)
    }

    handleCancel() {
        this.props.closeAboutDioalog()
    }

    render() {

        return (
            <Modal className="" show={this.props.hideDialog} onHide={() => {}}>
                <Modal.Header>
                    <Modal.Title>About</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div>
                        <h3>Contributers:</h3>
                        <ul>
                            <li>Edvard Gjessing Bakken</li>
                            <li>Lavrans Grønseth</li>
                            <li>Odd Kristian Kvarmestøl</li>
                            <li>Lars Møster</li>
                            <li>Maria Rønning</li>
                            <li>Fredrik Johannes Gillebo Sørmo</li>
                            <li>Silje Marie Tyrihjell</li>
                        </ul>
                        Developed for Nordic Semiconductor. All rights reserved.
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <div className="form-group">
                        <Button
                            type="button"
                            onClick={() => this.handleCancel()}
                            className="btn btn-default btn-sm btn-nordic"
                        >
                            Cancel
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
        );
    }

}