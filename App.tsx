import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import React from "react";
import LevelList from "./LevelList";
import Graph from "./Graph";
import FoceDiagram from "./ForceDiagram";
import { send, fetchGraph } from "./Edge";
import ForceDiagram from "./ForceDiagram";

type State = { area: string; mode: boolean; graphData: any };
type Props = {};

class App extends React.Component<Props, State> {
  levels: LevelList;
  map: Map<string, string>;

  constructor(props: Props) {
    super(props);
    this.state = { area: "", mode: true, graphData: { nodes: [], links: [] } };
    this.levels = new LevelList("");
    this.map = new Map<string, string>();
    this.fetchDB();
    console.log(this.levels);
  }

  async componentDidMount() {
    let gd = await fetchGraph();
    this.setState({ mode: false, graphData: gd });
  }

  async handleTabPress() {
    if (this.state.mode === true) {
      let gd = await fetchGraph();
      document.body.style.backgroundColor = "var(--color-primary)"; // Set background color
      this.setState({ mode: false, graphData: gd });
    } else {
      document.body.style.backgroundColor = "var(--color-secondary)";
      this.setState({ mode: true });
    }
  }

  handleDismissKeyboard = () => {
    Keyboard.dismiss(); // Dismiss the keyboard
  };

  splitComponent() {
    return (
      <View style={styles.container}>
        <View style={styles.top}>
          <TextInput
            multiline
            style={styles.text}
            value={this.state.area}
            onChangeText={this.handleChange.bind(this)}
            selectionColor="#fffdf3"
          />
        </View>
        <TouchableWithoutFeedback onPress={this.handleDismissKeyboard}>
          <View style={styles.bottom}>
            <ForceDiagram width={100} height={100} range={10} />
          </View>
        </TouchableWithoutFeedback>
      </View>
    );
  }

  fullComponent() {
    if (this.state.mode) {
      return this.graphComponent();
    } else {
      return this.editorComponent();
    }
  }

  graphComponent() {
    return (
      <View>
        <TextInput value={this.state.area} onChangeText={this.handleChange} />
      </View>
    );
  }

  editorComponent() {
    return (
      <View>
        <Graph graphData={this.state.graphData} />
      </View>
    );
  }

  render() {
    return this.splitComponent();
  }

  handleChange(text: string) {
    let newArea = text;
    let loadMatch = newArea.match(">load_.* ");
    let saveMatch = newArea.match(">save_.* ");
    let deleteMatch = newArea.match(">delete_.* ");
    if (newArea.includes(">close ")) {
      newArea = newArea.replace(">close ", "");
      this.levels.delete();
    } else if (loadMatch) {
      let fileName = loadMatch[0].split("_")[1].replace(" ", "");
      console.log(fileName);
      if (fileName === "master") {
        this.list();
      } else {
        this.load(fileName);
      }
    } else if (saveMatch) {
      let fileName = saveMatch[0].split("_")[1].replace(" ", "");
      this.save(
        fileName,
        this.levels.head.value.replace(">save_" + fileName, "")
      );
      newArea = newArea.replace(">save_" + fileName + " ", "");
      this.levels.tail.value = newArea;
    } else if (deleteMatch) {
      let fileName = deleteMatch[0].split("_")[1].replace(" ", "");
      this.delete(fileName);
      newArea = newArea.replace(">delete_" + fileName + " ", "");
      this.levels = new LevelList(newArea);
    } else if (newArea.includes(">exp ")) {
      newArea = newArea.replace(">exp ", "");
      this.levels.tail.value = newArea;
      newArea = this.expand(newArea);
      this.levels.append(newArea);
    } else {
      this.levels.tail.value = newArea;
    }
    this.setState({
      area: this.levels.tail.value,
    });
  }

  async load(filename: string) {
    console.log(this.map);
    let content = this.map.get(filename);
    if (content == null) {
      return false;
    }
    content = this.removeTrailingSpace(content);
    if (content !== undefined) {
      console.log("Sucessful Load");
      this.levels = new LevelList(content);
    } else {
      console.log("Load failed");
    }
  }

  async save(bracket: string, content: string) {
    content = this.removeTrailingSpace(content);
    var xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      "http://konradbogen.com/app/php/write.php?bracket=fo?content=fi",
      true
    );
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.onload = async () => {
      console.log(xhr.responseText);
      await this.fetchDB();
      await send(this.map);
      setTimeout(async () => {
        let gd = await fetchGraph();
        this.setState({ mode: false, graphData: gd });
      }, 300);
    };
    await xhr.send("bracket=" + bracket + "&content=" + content);
  }

  async delete(bracket: string) {
    var xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      "http://konradbogen.com/app/php/delete.php?bracket=fo",
      true
    );
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.onload = async () => {
      console.log(xhr.responseText);
      await this.fetchDB();
      await send(this.map);
      setTimeout(async () => {
        let gd = await fetchGraph();
        this.setState({ mode: false, graphData: gd });
      }, 300);
    };
    await xhr.send("bracket=" + bracket);
  }

  async fetchDB() {
    try {
      console.log("FETCH");
      let response = await fetch("http://konradbogen.com/app/php/read.php");
      console.log(response.status);
      console.log(response.statusText);
      if (response.status === 200) {
        let data = await response.text();
        data = JSON.parse(data);
        this.makeMap(data);
        console.log(this.map);
      }
    } catch (ex) {
      console.log("Error fetching DB");
      console.log(ex);
    }
  }

  makeMap(data: any) {
    console.log(data);
    for (const key in data) {
      let obj = data[key];
      this.map.set(obj.bracket, obj.content);
    }
  }

  list() {
    let text = "";
    this.map.forEach((_value, key) => {
      if (key !== "master") {
        text += "[" + key + "]\n";
      }
    });
    this.levels = new LevelList(text);
  }

  removeTrailingSpace(str: string) {
    return str.replace(/\n+$/, "");
  }

  expand(from: string) {
    let currentMap = new Map();
    this.map.forEach((_value, key) => {
      if (from.includes(key)) {
        currentMap.set(key, _value);
      }
    });
    let expanded = from;
    currentMap.forEach((_value, key) => {
      let bracketKey = "[" + key + "]";
      let content = _value;
      content = this.removeTrailingSpace(content);
      expanded = expanded.replaceAll(bracketKey, content);
    });
    console.log("exp");
    console.log(expanded);
    return expanded;
  }
}

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fffdf3",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column", // Ensures vertical arrangement
  },
  top: {
    top: 40,
    flex: 0.5,
    backgroundColor: "#fffdf3",
    borderWidth: 5,
    borderColor: "#fffdf3",
    width: "100%",
  },
  bottom: {
    flex: 0.5,
    backgroundColor: "#3c3c3c",
    borderWidth: 5,
    borderColor: "#3c3c3c",
    width: "100%",
  },
  text: {
    backgroundColor: "#fffdf3",
    color: "#3c3c3c",
    fontSize: 16,
    flex: 1,
  },
});
