class Node {
  constructor(key, value) {
    this.key = key;
    this.value = value;
    this.prev = null;
    this.next = null;
  }
}

export default class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = Object.create(null);
    this.head = null;
    this.tail = null;
    this.size = 0;
  }

  get(key) {
    const node = this.cache[key];

    if (!node) return undefined;

    this.moveToFront(node);
    return node.value;
  }

  put(key, value) {
    const node = this.cache[key];

    if (node) {
      node.value = value;
      this.moveToFront(node);
      return { updated: true, evicted: null };
    }

    const newNode = new Node(key, value);
    this.addToFront(newNode);
    this.cache[key] = newNode;
    this.size += 1;

    let evicted = null;
    if (this.size > this.capacity) {
      evicted = this.tail;
      this.remove(evicted);
      delete this.cache[evicted.key];
      this.size -= 1;
    }

    return { updated: false, evicted };
  }

  remove(node) {
    if (node.prev) node.prev.next = node.next;
    else this.head = node.next;

    if (node.next) node.next.prev = node.prev;
    else this.tail = node.prev;

    node.prev = null;
    node.next = null;
  }

  addToFront(node) {
    node.prev = null;
    node.next = this.head;

    if (this.head) this.head.prev = node;
    else this.tail = node;

    this.head = node;
  }

  // Move node to MRU position.
  moveToFront(node) {
    this.remove(node);
    this.addToFront(node);
  }
}
