import { useRef, useState } from 'react';
import LRUCache from './LRUCache';
import './App.css';

function getCacheItems(cache) {
  const items = [];
  let node = cache.head;

  while (node) {
    items.push({ key: node.key, value: node.value });
    node = node.next;
  }

  return items;
}

export default function App() {
  const cache = useRef(null);
  const [capacityInput, setCapacityInput] = useState('');
  const [capacity, setCapacity] = useState(null);
  const [putKey, setPutKey] = useState('');
  const [putValue, setPutValue] = useState('');
  const [getKey, setGetKey] = useState('');
  const [items, setItems] = useState([]);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ hits: 0, misses: 0, evictions: 0 });
  const [lastOperation, setLastOperation] = useState('Set a cache capacity to begin.');
  const [message, setMessage] = useState('');

  function setCapacityForCache() {
    const value = Number(capacityInput);

    if (!capacityInput.trim()) return setMessage('Capacity cannot be empty.');
    if (!Number.isInteger(value) || value <= 0) {
      return setMessage('Capacity must be a whole number greater than 0.');
    }

    cache.current = new LRUCache(value);
    setCapacity(value);
    setItems([]);
    setHistory([]);
    setStats({ hits: 0, misses: 0, evictions: 0 });
    setLastOperation('Cache is ready. Add a key and value using PUT.');
    setMessage('');
  }

  function handlePut() {
    const key = putKey.trim();
    const value = putValue.trim();

    if (capacity === null) return setMessage('Set cache capacity first.');
    if (!key) return setMessage('Key cannot be empty.');
    if (!value) return setMessage('Value cannot be empty.');

    const result = cache.current.put(key, value);
    const action = result.updated ? 'Updated and moved to MRU' : 'Added';
    const eviction = result.evicted ? ` -> Evicted ${result.evicted.key}` : '';

    setItems(getCacheItems(cache.current));
    setHistory((current) => [...current, `PUT ${key} = ${value}${eviction}`]);
    setStats((current) => ({
      ...current,
      evictions: current.evictions + (result.evicted ? 1 : 0),
    }));
    setLastOperation(`PUT ${key} = ${value} -> ${action}${eviction}`);
    setPutKey('');
    setPutValue('');
    setMessage('');
  }

  function handleGet() {
    const key = getKey.trim();

    if (capacity === null) return setMessage('Set cache capacity first.');
    if (!key) return setMessage('Key cannot be empty.');

    const value = cache.current.get(key);
    const hit = value !== undefined;

    setItems(getCacheItems(cache.current));
    setHistory((current) => [...current, `GET ${key} -> ${hit ? 'HIT' : 'MISS'}`]);
    setStats((current) => ({
      ...current,
      hits: current.hits + (hit ? 1 : 0),
      misses: current.misses + (hit ? 0 : 1),
    }));
    setLastOperation(hit ? `GET ${key} -> Cache Hit (value: ${value})` : `GET ${key} -> Cache Miss`);
    setGetKey('');
    setMessage('');
  }

  function resetCache() {
    cache.current = null;
    setCapacityInput('');
    setCapacity(null);
    setPutKey('');
    setPutValue('');
    setGetKey('');
    setItems([]);
    setHistory([]);
    setStats({ hits: 0, misses: 0, evictions: 0 });
    setLastOperation('Cache reset. Set a new capacity to begin.');
    setMessage('');
  }

  const totalRequests = stats.hits + stats.misses;
  const hitRate = totalRequests ? ((stats.hits / totalRequests) * 100).toFixed(2) : '0.00';

  return (
    <main className="page">
      <header className="header">
        <p className="eyebrow">Data Structures Minor Project</p>
        <h1>LRU Cache Simulator</h1>
        <p>Hash Map + Doubly Linked List</p>
      </header>

      <section className="capacity-panel" aria-labelledby="capacity-heading">
        <div>
          <h2 id="capacity-heading">Cache Capacity</h2>
          <p>Set the maximum number of items before starting.</p>
        </div>
        <div className="capacity-form">
          <input
            aria-label="Cache capacity"
            type="number"
            min="1"
            placeholder="Example: 3"
            value={capacityInput}
            disabled={capacity !== null}
            onChange={(event) => setCapacityInput(event.target.value)}
          />
          <button type="button" onClick={setCapacityForCache} disabled={capacity !== null}>
            SET CAPACITY
          </button>
        </div>
      </section>

      {message && <p className="message" role="alert">{message}</p>}

      <section className="operations" aria-label="Cache operations">
        <form className="operation" onSubmit={(event) => { event.preventDefault(); handlePut(); }}>
          <h2>PUT</h2>
          <label>
            Key
            <input value={putKey} onChange={(event) => setPutKey(event.target.value)} placeholder="A" disabled={capacity === null} />
          </label>
          <label>
            Value
            <input value={putValue} onChange={(event) => setPutValue(event.target.value)} placeholder="100" disabled={capacity === null} />
          </label>
          <button type="submit" disabled={capacity === null}>PUT</button>
        </form>

        <form className="operation" onSubmit={(event) => { event.preventDefault(); handleGet(); }}>
          <h2>GET</h2>
          <label>
            Key
            <input value={getKey} onChange={(event) => setGetKey(event.target.value)} placeholder="A" disabled={capacity === null} />
          </label>
          <button type="submit" disabled={capacity === null}>GET</button>
        </form>
      </section>

      <section className="cache-section" aria-labelledby="cache-heading">
        <div className="section-heading">
          <div>
            <p className="section-label">Current state</p>
            <h2 id="cache-heading">Cache</h2>
          </div>
          <p className="size-note">{items.length} of {capacity ?? 0} slots used</p>
        </div>
        <div className="cache-view">
          <div className="cache-labels"><span>MRU (Most Recent)</span><span>LRU (Least Recent)</span></div>
          {items.length ? (
            <div className="cache-chain">
              {items.map((item, index) => (
                <div className="chain-item" key={item.key}>
                  <div className="cache-node"><span>{item.key}</span><b>{item.value}</b></div>
                  {index < items.length - 1 && <span className="link-arrow" aria-hidden="true">&harr;</span>}
                </div>
              ))}
            </div>
          ) : <p className="empty-cache">No items in the cache yet.</p>}
          <div className="cache-pointers"><span>head &rarr; MRU</span><span>tail &rarr; LRU</span></div>
        </div>
      </section>

      <p className="last-operation"><b>Last Operation:</b> {lastOperation}</p>

      <section className="details">
        <div className="statistics">
          <h2>Statistics</h2>
          <dl>
            <div><dt>Capacity</dt><dd>{capacity ?? '-'}</dd></div>
            <div><dt>Current Size</dt><dd>{items.length}</dd></div>
            <div><dt>Hits</dt><dd>{stats.hits}</dd></div>
            <div><dt>Misses</dt><dd>{stats.misses}</dd></div>
            <div><dt>Evictions</dt><dd>{stats.evictions}</dd></div>
            <div><dt>Hit Rate</dt><dd>{hitRate}%</dd></div>
          </dl>
        </div>

        <div className="history">
          <h2>Operation History</h2>
          {history.length ? <ol>{history.map((entry, index) => <li key={`${entry}-${index}`}>{entry}</li>)}</ol> : <p>No operations yet.</p>}
        </div>
      </section>

      <section className="complexity" aria-labelledby="complexity-heading">
        <h2 id="complexity-heading">Complexity Information</h2>
        <div>
          <p><b>GET</b><span>O(1)</span></p>
          <p><b>PUT</b><span>O(1)</span></p>
          <p><b>Space</b><span>O(capacity)</span></p>
        </div>
        <p className="data-structures"><b>Data Structures Used</b><span>Hash Map</span><span>Doubly Linked List</span></p>
      </section>

      <button type="button" className="reset" onClick={resetCache}>RESET</button>
    </main>
  );
}
