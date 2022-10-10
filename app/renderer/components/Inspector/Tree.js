import React, { useState } from 'react';
import { connect } from 'react-redux';

function Tree (props) {
    
    if (Array.isArray(props.currentPO) && props.currentPO.length > 0) {
        let currentPO = props.currentPO[props.currentPO.length - 1];
        let filteredPO = props.treeData.filter((po) => po.root.includes(currentPO));
        return (
            <ul>
                <TreeNode node={filteredPO[0]} curPO={currentPO} />
                <hr></hr>
                {
                    props.treeData.map((po) => (
                        <TreeNode node={po} curPO={currentPO} />
                    ))}
            </ul>
        );
    } else {
        let currentPO = '###';
        return (
            <ul>
                {
                    props.treeData.map((po) => (
                        <TreeNode node={po} curPO={currentPO} />
                    ))}
            </ul>
        );
    }
    
}

const mapStateToProps = (state) => ({
    currentPO: state.inspector.locatedRootElements
});

export default connect(mapStateToProps)(Tree);

function TreeNode({ node, curPO }) {
    const label = node.root;
    const methods = node.children.methods;
    const children = node.children.children;
    const rootSelector = node.children.rootSelector;

    const [showChildren, setShowChildren] = useState(false);

    const handleClick = () => {
        setShowChildren(!showChildren);
    };

    return (
        <>
            <div onClick={handleClick} style={{ marginBottom: '10px', marginTop: '10px', fontSize: '20px' }}>
                <li style={{ backgroundColor: label == curPO ? 'powderblue' : 'transparent' }}>{label}</li>
                <ul>Methods
                    {methods.map(
                        (method) =>
                            <>
                                <li style={{ listStyleType: 'none', marginBottom: '5px', paddingLeft: '10px', fontSize: '15px' }}>{method}</li>
                            </>
                    )}
                </ul>
                <ul>Root
                    <li style={{ listStyleType: 'none', marginBottom: '5px', paddingLeft: '10px', fontSize: '15px' }}>type: [{rootSelector.type}]</li>
                    <li style={{ listStyleType: 'none', marginBottom: '5px', paddingLeft: '10px', fontSize: '15px' }}>iOS: [{rootSelector.ios}]</li>
                    <li style={{ listStyleType: 'none', marginBottom: '5px', paddingLeft: '10px', fontSize: '15px' }}>Android: [{rootSelector.android}]</li>
                </ul>
            </div>
            <div>
                <ul style={{ paddingLeft: '10px' }}>
                    {showChildren && children.map(
                        (child) =>
                            <>
                                <li style={{ listStyleType: 'none', marginBottom: '5px', paddingLeft: '10px', fontSize: '15px' }}> {child.name}</li>
                                <li style={{ listStyleType: 'none', marginBottom: '5px', paddingLeft: '10px', fontSize: '15px' }}> Methods: [{child.methods.join(' ')}]</li>
                            </>
                    )}
                </ul>
            </div>
        </>
    );
}