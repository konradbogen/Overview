async function send(map: Map<String, String>) {
  console.log("SEND EGDE");
  const edges = Array<Object>();
  map.forEach((_value, key) => {
    // eslint-disable-next-line no-useless-escape
    // Regular expression pattern to match [something]
    const regexPattern = /\[[^\]]+\]/g;

    // Using match() with the regex pattern to get all matches
    const matches = _value.match(regexPattern);
    if (matches != null) {
      matches.forEach((target) => {
        let edge = {
          source: key,
          target: target.replace("[", "").replace("]", ""),
          value: 1,
        };
        edges.push(edge);
        console.log(edge);
      });
    }
  });
  console.log(edges);
  await sendRequest(edges);
}

async function nodes() {
  let response = await fetch("http://konradbogen.com/app/php/read.php");
  console.log(response.status);
  console.log(response.statusText);
  if (response.status === 200) {
    let data = await response.text();
    data = JSON.parse(data);
    return makeNodes(data);
  }
  return null;
}

function makeNodes(data: any) {
  console.log(data);
  let nodes: Array<Object> = [];
  for (const key in data) {
    nodes.push({ id: data[key].bracket, group: 1 });
  }
  return nodes;
}

async function fetchGraph() {
  let _edges = await fetchEdges();
  let _nodes = await nodes();
  if (_nodes != null && _edges != null) {
    _nodes = nodesFromEdges(_edges, _nodes);
  }
  return { nodes: _nodes, links: _edges };
}

function nodesFromEdges(edges: any, nodes: any) {
  let knownNodes: Array<String> = nodes.map((node: { id: string }) => node.id);
  edges.forEach((edge: any) => {
    if (knownNodes.includes(edge.source) === false) {
      knownNodes.push(edge.source);
      nodes.push({ id: edge.source, group: 1 });
    }
    if (knownNodes.includes(edge.target) === false) {
      knownNodes.push(edge.target);
      nodes.push({ id: edge.target, group: 1 });
    }
  });
  return nodes;
}

async function fetchEdges() {
  let response = await fetch("http://konradbogen.com/app/php/getEdges.php");
  console.log(response.status);
  console.log(response.statusText);
  if (response.status === 200) {
    let data = await response.text();
    console.log("fetch edges");
    console.log(data);
    data = JSON.parse(data);
    console.log("FINAL");
    console.log(data);
    return data;
  }
  return null;
}

function sendRequest(edges: Array<Object>) {
  // Send JSON data to PHP script using fetch API
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "http://konradbogen.com/app/php/edge.php", true);
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.onload = () => {
    console.log(xhr.responseText);
  };
  xhr.send(JSON.stringify(edges));
}

export { send, fetchGraph };
