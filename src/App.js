import React, { Component } from 'react';
import './App.css';
import dataLatest from './resources/data-latest.csv';
import Griddle, {plugins, RowDefinition, ColumnDefinition} from 'griddle-react';
import logo from './resources/logo.svg';
import moment from 'moment';

const NewLayout = ({ Table, Pagination, Filter, SettingsWrapper }) => (
  <div>
    <div className='table-header'>
      <div className="table-header-nav">
        <Filter />
      </div>
      <div className="table-header-brand">
        <img src={logo} />
      </div>
    </div>
    <div class='table-content'>
      <Table />
    </div>
    <SettingsWrapper />
  </div>
);

const CustomColumn = (value) => {
  // console.log(value);
  if (-1 === ['Name/Title', 'Start Date', 'End Date'].indexOf(value.columnId)) {
    const date = moment(value.value);
    console.log([value, date.format()]);
    const now = moment();

    return (<span className={['cell', value.value ? 'cell--active': '', now.isAfter(date) ? 'cell--past': '',].join(' ')}></span>);
  }

  return (<span className={['cell--text', 'cell--' + value.columnId.toLowerCase().replace(/[^\w-_]/, '_')].join(' ')}>{value.value}</span>);
};

const CustomHeading = (value) => {
  if (-1 === ['Name/Title', 'Start Date', 'End Date'].indexOf(value.columnId)) {
    const date = moment(value.title);
    const now = moment();
    return (<span className={[value.className, now.isAfter(date) ? 'cell--past': ''].join(' ')}>{date.format('DD-MM')}</span>)
  }

  return (<span className={value.className}>{value.title}</span>);
};

class App extends Component {
  constructor(props) {
    super(props)

    let data = [];
    for (let i = 1; i < dataLatest.length; ++i) {
      data.push({});

      for (let j = 0; j < dataLatest[0].length; ++j) {
        data[i - 1][dataLatest[0][j]] = dataLatest[i][j];
      }
    }

    console.log(data);

    let currentProject = 0;
    let projects = [];
    for (let i = 0; i < data.length; ++i) {
      if (!data[i].i) {
        continue;
      }

      if (currentProject === 0) {
        currentProject = parseInt(data[i].i);
      }

      if (parseInt(data[i].i) !== currentProject) {
        currentProject = parseInt(data[i].i);
      }

      if (typeof projects[currentProject] === 'undefined') {
        projects[currentProject] = data[i];
        projects[currentProject].tasks = [];
      }

      if (currentProject != data[i].i && parseInt(data[i].i) === currentProject) {
        projects[currentProject].tasks.push(data[i]);
      }
    };

    projects = projects.filter(val => val);

    const columns = [
      {
        'Header': 'Projet',
        'accessor': 'Name/Title',
      },
      {
        'Header': 'Start',
        'accessor': 'Start Date',
      },
      {
        'Header': 'End',
        'accessor': 'End Date',
      }
    ];

    const now = moment().startOf('month');

    var max = now;
    for (var i = 0; i < projects.length; ++i) {
      var m = moment.max(max, moment(projects[i]['End Date']));
      if (m) {
        max = m;
      }
    }

    let hoo = now.clone();
    let steps = [];
    while (moment.max(hoo, max).isSame(max)) {
      steps.push(hoo.clone())
      columns.push({
        'Header': hoo.format(),
        'step': true,
      })
      hoo.add(15, 'days');
    }

    for (var i = 0; i < projects.length; ++i) {
      columns.forEach((columnData, columnIndex) => {
        if (columnData.step) {
          projects[i][columnData.Header] = (
              moment(projects[i]['Start Date']).isBefore(moment(columns[Math.min(columns.length - 1, columnIndex + 1)].Header))
            )
            && (
              moment(projects[i]['End Date']).isAfter(moment(columnData.Header))
            ) ? columnData.Header: null
          ;
        }
      });
    }

    this.state = {
      'steps': steps,
      'now': now,
      'max': max,
      'columns': columns,
      'data': projects,
    }
  }

  render() {
    return (
      <div className='layout'>
        <div className='layout-content'>
          <Griddle
            components={{Layout: NewLayout}}
            data={this.state.data}
            plugins={[plugins.LocalPlugin]}
            pageProperties={{
              pageSize: 100
            }}
          >
            <RowDefinition>
              {this.state.columns.map((column) => {
                console.log(column.Header)
                return (<ColumnDefinition id={column.accessor ? column.accessor: column.Header} title={column.Header} customHeadingComponent={CustomHeading} customComponent={CustomColumn} />);
              })}
            </RowDefinition>
          </Griddle>
        </div>
      </div>
    );
  }
}

export default App;
