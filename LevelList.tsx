import Level from "./Level";

class LevelList {
  length: number;
  head: Level;
  tail: Level;
  constructor(value: string) {
    this.length = 1;
    this.head = new Level(value);
    this.tail = this.head;
  }

  append(value: string) {
    let next = new Level(value);
    this.tail.next = next;
    this.tail = next;
  }

  delete() {
    let secondLast = this.head;
    while (secondLast.next != null) {
      if (secondLast.next.next == null) {
        secondLast.next = null;
        break;
      } else {
        secondLast = secondLast.next;
      }
    }
    this.tail = secondLast;
  }
}

export default LevelList;
