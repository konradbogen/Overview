class Level {
  value: any;
  next: Level | null;
  constructor(value: string) {
    this.value = value;
    this.next = null;
  }
}

export default Level;
