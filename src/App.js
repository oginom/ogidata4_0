// import logo from './logo.svg';
// import './App.css';
// 
// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }
// 
// export default App;

import logo from './logo.svg';
import './App.css';

import React, { Component } from 'react';
import { API, graphqlOperation } from "aws-amplify";
import { listTodos } from './graphql/queries';
import { createTodo } from './graphql/mutations';
import { onCreateTodo } from './graphql/subscriptions';

class App extends Component {

  state = {
    todos: [],
    name: "",
    description: ""
  }

  async componentDidMount() {
    try {
      const todos = await API.graphql(graphqlOperation(listTodos))
      console.log('todos: ', todos)
      this.setState({ todos: todos.data.listTodos.items })
    } catch (e) {
      console.log(e)
    }

    API.graphql(graphqlOperation(onCreateTodo)).subscribe({
      next: (eventData) => {
        console.log('eventData: ', eventData)
        const todo = eventData.value.data.onCreateTodo
        const todos = [...this.state.todos.filter(content => {
          return (content.name !== todo.name)
        }), todo]
        this.setState({ todos })
      }
    })
  }

  createTodo = async () => {
    // バリデーションチェック
    if (this.state.name === '' || this.state.description === '') return

    // 新規登録 mutation
    const createTodoInput = {
      name: this.state.name,
      description: this.state.description
    }

    // 登録処理
    try {
      const todos = [...this.state.todos, createTodoInput]
      this.setState({ todos: todos, name: "", description: "" })
      await API.graphql(graphqlOperation(createTodo, { input: createTodoInput }))
      console.log('createTodoInput: ', createTodoInput)
    } catch (e) {
      console.log(e)
    }
  }

  onChange = e => {
    this.setState({ [e.target.name]: e.target.value })
  }

  render() {
    var list = [];
    for(var i in this.state.todos.sort()){
      list.push(
        <div key={i}>
          <div>{this.state.todos[i].name}</div>
          <div>{this.state.todos[i].description}</div>
        </div>
      );
    }

    return (
      <div className="App">
        <img src={logo} className="App-logo" alt="logo" />
        <div>
          名前
        <input value={this.state.name} name="name" onChange={this.onChange}></input>
        </div>
        <div>
          説明
        <input value={this.state.description} name="description" onChange={this.onChange}></input>
        </div>
        <button onClick={this.createTodo}>追加</button>
        <div>
          {list}
        </div>
      </div>
    )
  }
}

export default App;
