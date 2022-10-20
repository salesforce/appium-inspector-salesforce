import React from 'react';
import { connect } from 'react-redux';
import { JSONTree } from 'react-json-tree';

function Tree (props) {
    let mapPONode = (po) => {
        let newPO = {};
        newPO[po.name] = {};
        if (po.root) {
            newPO[po.name].root = po.root;
        }
        if (po.selector) {
            newPO[po.name].selector = po.selector;
        }
        if (po.methods) {
            newPO[po.name].methods = po.methods;
        }

        return (
            <ul>
                <JSONTree data={newPO} hideRoot={true} theme={{ base00: '#000', base0B: '#BBB', base0D: '#FFF' }} />
            </ul>
        );
    }

    let selectedPO = props.treeData;
    if (Array.isArray(props.currentPO) && props.currentPO.length > 0) {
        selectedPO = props.treeData.filter((po) => props.currentPO.includes(po.name));
    }
    return (
        <div>
            {
                selectedPO.map((po) => mapPONode(po))
            }
            <br></br>
            <br></br>
        </div>
    );
}

const mapStateToProps = (state) => ({
    currentPO: state.inspector.locatedRootElements
});

export default connect(mapStateToProps)(Tree);
