import React from 'react';
import XLSX from 'xlsx';
import _ from 'lodash';

import sheetConfig from './sheetConfig';

/* xlsx.js (C) 2013-present  SheetJS -- http://sheetjs.com */
/* Notes:
   - usage: `ReactDOM.render( <SheetJSApp />, document.getElementById('app') );`
   - xlsx.full.min.js is loaded in the head of the HTML page
   - this script should be referenced with type="text/babel"
   - babel.js in-browser transpiler should be loaded before this script
*/
export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [], /* Array of Arrays e.g. [["a","b"],[1,2]] */
      cols: [],  /* Array of column objects e.g. { name: "C", K: 2 } */
      type: 'Max'
    };
  };

  handleFile = (e/*:File*/) => {
    const files = e.target.files;
    const file = files[0];
    /* Boilerplate to set up FileReader */
    const reader = new FileReader();
    const rABS = !!reader.readAsBinaryString;
    reader.onload = (e) => {
      /* Parse data */
      const bstr = e.target.result;
      const wb = XLSX.read(bstr, { type: rABS ? 'binary' : 'array' });
      /* Get first worksheet */
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      /* Convert array of arrays */
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

      let finalData;
      if (this.state.type === 'Max') {
        finalData = data.map(row => {
          let currentRecord = {};
          _.forIn(sheetConfig.maxCard.columns, (value, key) => currentRecord[key] = row[value]);
          return currentRecord;
        });
      } else if (this.state.type === 'Isra') { }
      /* Update state */
      this.setState({ data: finalData, cols: make_cols(ws['!ref']) });
    };
    if (rABS) reader.readAsBinaryString(file); else reader.readAsArrayBuffer(file);
  };

  // exportFile() {
  //     /* convert state to workbook */
  //     const ws = XLSX.utils.aoa_to_sheet(this.state.data);
  //     const wb = XLSX.utils.book_new();
  //     XLSX.utils.book_append_sheet(wb, ws, "SheetJS");
  //     /* generate XLSX file and send to client */
  //     XLSX.writeFile(wb, "sheetjs.xlsx")
  // };
  render() {
    return (
      <React.Fragment>
        <div className="row"><div className="col-xs-12">
          <form className="form-inline">
            <div className="form-group">
              <label htmlFor="type">Type: </label>
              <select className="form-control" name="type" onChange={(type) => this.setState({ type })}>
                <option>Max</option>
                <option>Isra</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="file">Spreadsheet</label>
              <input type="file" className="form-control" name="file" accept={SheetJSFT} onChange={this.handleFile} />
            </div>
          </form>
        </div></div>

        <div className="row"><div className="col-xs-12">
          {/* <OutTable data={this.state.data} cols={this.state.cols} /> */}
          <pre>{JSON.stringify(this.state.data, null, 2)}</pre>
        </div></div>
      </React.Fragment>
    );
  };
};

/* list of supported file types */
const SheetJSFT = [
  "xlsx", "xlsb", "xlsm", "xls", "xml", "csv", "txt", "ods", "fods", "uos", "sylk", "dif", "dbf", "prn", "qpw", "123", "wb*", "wq*", "html", "htm"
].map(function (x) { return "." + x; }).join(",");

/* generate an array of column objects */
const make_cols = refstr => {
  let o = [], C = XLSX.utils.decode_range(refstr).e.c + 1;
  for (var i = 0; i < C; ++i) o[i] = { name: XLSX.utils.encode_col(i), key: i }
  return o;
};
