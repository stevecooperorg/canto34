import React from 'react';

const codeEditorStyle = {
  width: '90%', // yuck! get 100% minus margin
  margin: '25px',
  minHeight: '250px',
  border: '4px solid black',
  boxSizing: 'border-box'
};

const CodeEditor = ({ code }) => {
  return <textarea style={codeEditorStyle} defaultValue={code.text} />;
};

export default CodeEditor;
