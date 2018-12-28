/*
 *  Copyright (c) 2018-present, Evgeny Nadymov
 *
 * This source code is licensed under the GPL v.3.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import { withStyles } from '@material-ui/core/styles';
import red from '@material-ui/core/colors/red';
import orange from '@material-ui/core/colors/orange';
import yellow from '@material-ui/core/colors/yellow';
import green from '@material-ui/core/colors/green';
import blue from '@material-ui/core/colors/blue';
import indigo from '@material-ui/core/colors/indigo';
import deepPurple from '@material-ui/core/colors/deepPurple';
import ApplicationStore from '../../Stores/ApplicationStore';

const styles = theme => ({
    formControl: {
        margin: theme.spacing.unit * 3
    },
    group: {
        margin: `${theme.spacing.unit}px 0`
    },
    redRoot: {
        color: red[600],
        '&$checked': {
            color: red[500]
        }
    },
    orangeRoot: {
        color: orange[600],
        '&$checked': {
            color: orange[500]
        }
    },
    yellowRoot: {
        color: yellow[600],
        '&$checked': {
            color: yellow[500]
        }
    },
    greenRoot: {
        color: green[600],
        '&$checked': {
            color: green[500]
        }
    },
    blueRoot: {
        color: blue[600],
        '&$checked': {
            color: blue[500]
        }
    },
    indigoRoot: {
        color: indigo[600],
        '&$checked': {
            color: indigo[500]
        }
    },
    deepPurpleRoot: {
        color: deepPurple[600],
        '&$checked': {
            color: deepPurple[500]
        }
    },
    checked: {}
});

class ThemePicker extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            open: false,
            type: this.props.theme.palette.type,
            color: 'blue'
        };
    }

    handleChange = event => {
        this.setState({ type: event.target.value });

        ApplicationStore.emit('clientUpdateThemeChanging', {
            type: event.target.value,
            primary: this.getColor(this.state.color)
        });
        //onThemeChange(event.target.value, this.getColor(this.state.accent));
    };

    handleAccentChange = event => {
        this.setState({ color: event.target.value });

        ApplicationStore.emit('clientUpdateThemeChanging', {
            type: this.state.type,
            primary: this.getColor(event.target.value)
        });

        //onThemeChange(this.state.value, this.getColor(event.target.value));
    };

    getColor = value => {
        switch (value) {
            case 'red':
                return red;
            case 'orange':
                return orange;
            case 'yellow':
                return yellow;
            case 'green':
                return green;
            case 'blue':
                return blue;
            case 'indigo':
                return indigo;
            case 'deepPurple':
                return deepPurple;
        }

        return null;
    };

    handleClose = () => {
        this.setState({ open: false });
    };

    open = () => {
        this.setState({ open: true });
    };

    render() {
        const { classes } = this.props;
        const { type, color } = this.state;

        return (
            <Dialog
                open={this.state.open}
                onClose={this.handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description">
                <DialogTitle id="alert-dialog-title">Appearance</DialogTitle>
                <DialogContent>
                    <FormControl component="fieldset" className={classes.formControl}>
                        <FormLabel focused component="legend">
                            Theme
                        </FormLabel>
                        <RadioGroup
                            aria-label="theme"
                            name="theme1"
                            className={classes.group}
                            value={type}
                            onChange={this.handleChange}>
                            <FormControlLabel value="light" control={<Radio color="primary" />} label="Light" />
                            <FormControlLabel value="dark" control={<Radio color="primary" />} label="Dark" />
                        </RadioGroup>
                    </FormControl>
                    <FormControl component="fieldset" className={classes.formControl}>
                        <FormLabel focused component="legend">
                            Accent
                        </FormLabel>
                        <RadioGroup
                            aria-label="accent"
                            name="accent1"
                            className={classes.group}
                            value={color}
                            onChange={this.handleAccentChange}>
                            <FormControlLabel
                                value="red"
                                control={
                                    <Radio
                                        classes={{
                                            root: classes.redRoot,
                                            checked: classes.checked
                                        }}
                                    />
                                }
                                label="Red"
                            />
                            <FormControlLabel
                                value="orange"
                                control={
                                    <Radio
                                        classes={{
                                            root: classes.orangeRoot,
                                            checked: classes.checked
                                        }}
                                    />
                                }
                                label="Orange"
                            />
                            <FormControlLabel
                                value="yellow"
                                control={
                                    <Radio
                                        classes={{
                                            root: classes.yellowRoot,
                                            checked: classes.checked
                                        }}
                                    />
                                }
                                label="Yellow"
                            />
                            <FormControlLabel
                                value="green"
                                control={
                                    <Radio
                                        classes={{
                                            root: classes.greenRoot,
                                            checked: classes.checked
                                        }}
                                    />
                                }
                                label="Green"
                            />
                            <FormControlLabel
                                value="blue"
                                control={
                                    <Radio
                                        classes={{
                                            root: classes.blueRoot,
                                            checked: classes.checked
                                        }}
                                    />
                                }
                                label="Blue"
                            />
                            <FormControlLabel
                                value="indigo"
                                control={
                                    <Radio
                                        classes={{
                                            root: classes.indigoRoot,
                                            checked: classes.checked
                                        }}
                                    />
                                }
                                label="Indigo"
                            />
                            <FormControlLabel
                                value="deepPurple"
                                control={
                                    <Radio
                                        classes={{
                                            root: classes.deepPurpleRoot,
                                            checked: classes.checked
                                        }}
                                    />
                                }
                                label="Deep Purple"
                            />
                        </RadioGroup>
                    </FormControl>
                </DialogContent>
            </Dialog>
        );
    }
}

ThemePicker.propTypes = {};

export default withStyles(styles, { withTheme: true })(ThemePicker);
