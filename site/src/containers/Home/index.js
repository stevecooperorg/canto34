import React from 'react';
import { push } from 'react-router-redux';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import CodeEditor from '../../components/CodeEditor';

const Home = props => (
  <div>
    <h1>Home</h1>
    <CodeEditor code={props.code} />
  </div>
);

const mapStateToProps = state => ({
  code: state.code
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      changePage: () => push('/about-us')
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(Home);
