import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props){ super(props); this.state = { error:null }; }
  static getDerivedStateFromError(error){ return { error }; }
  componentDidCatch(err, info){ console.error("UI error:", err, info); }
  render(){
    if (this.state.error){
      return (
        <div style={{padding:"16px"}}>
          <h1 style={{fontSize:"20px", fontWeight:600}}>Something went wrong.</h1>
          <pre style={{whiteSpace:"pre-wrap", background:"#fff", border:"1px solid #eee", padding:"12px", borderRadius:"8px", marginTop:"8px"}}>
            {String(this.state.error?.message || this.state.error)}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
