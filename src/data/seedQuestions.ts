import { Question } from '../types';

export const SEED_QUESTIONS: Question[] = [
  // 1. Single Choice: Hash Map Collision & Complexity
  {
    id: 'q-mcq-hashmap',
    type: 'single_choice',
    title: 'Hash Collision Worst-Case Complexity in Java 8+ HashMap',
    prompt: 'In modern Java (version 8 and newer), when multiple keys collide and hash to the same bucket in a `java.util.HashMap`, what is the worst-case time complexity of retrieving an element from that bucket once the bucket size crosses `TREEIFY_THRESHOLD` (8 items)?',
    skills: ['Data Structures', 'Algorithms', 'Java'],
    difficulty: 'intermediate',
    evidenceCategory: 'original_practice',
    gradingMethod: 'automatic',
    points: 10,
    options: [
      { id: 'opt-1', text: 'O(1) constant time via secondary Robin Hood hashing.' },
      { id: 'opt-2', text: 'O(log N) worst-case time because the linked list converts to a red-black balanced tree.' },
      { id: 'opt-3', text: 'O(N) linear time because the linked list remains unchanged regardless of collisions.' },
      { id: 'opt-4', text: 'O(N log N) time due to frequent automatic rehashing of the entire array table.' },
    ],
    correctOptionId: 'opt-2',
    explanation: 'Prior to Java 8, hash bucket collisions were chained purely as linear linked lists, leading to O(N) lookup degradation under deliberate or accidental hash collision attacks. In Java 8+, once a bucket reaches TREEIFY_THRESHOLD (8 entries) and the capacity is at least 64, the bucket is transformed into a Red-Black balanced binary search tree, guaranteeing O(log N) worst-case search and insertion.',
    hints: [
      'Think about the data structure upgrade Java introduced to prevent Denial of Service (DoS) hash collision attacks.',
      'A linked list is O(N), but balanced trees reduce this bound logarithmically.',
    ],
    commonPitfalls: [
      'Assuming hash tables always remain linked lists regardless of language version.',
      'Confusing Java HashMap collision resolution with Open Addressing (Robin Hood hashing).',
    ],
  },

  // 2. Multi-Select: TCP vs UDP Transport Layer Characteristics
  {
    id: 'q-multi-networking',
    type: 'multi_select',
    title: 'TCP Protocol Properties & Guarantees',
    prompt: 'Select ALL statements that accurately describe Transmission Control Protocol (TCP) as defined in RFC 793 and its modern congestion control extensions:',
    skills: ['Networks', 'Systems Programming'],
    difficulty: 'intermediate',
    evidenceCategory: 'original_practice',
    gradingMethod: 'automatic',
    points: 15,
    options: [
      { id: 'opt-tcp-1', text: 'TCP provides an in-order, byte-stream abstraction over an unreliable packet network.' },
      { id: 'opt-tcp-2', text: 'TCP enforces native message boundaries so the receiver always reads exactly one application-level message per recv() call.' },
      { id: 'opt-tcp-3', text: 'TCP implements flow control using a sliding window advertised by the receiver to prevent buffer overflow.' },
      { id: 'opt-tcp-4', text: 'TCP implements congestion control algorithms (e.g. CUBIC, BBR) to dynamically avoid saturating network transit paths.' },
      { id: 'opt-tcp-5', text: 'TCP headers contain no checksum, relying entirely on Layer 2 Ethernet CRC for error detection.' },
    ],
    correctOptionIds: ['opt-tcp-1', 'opt-tcp-3', 'opt-tcp-4'],
    explanation: 'Statements 1, 3, and 4 are correct. Statement 2 is FALSE: TCP is a continuous byte stream without application-level message boundaries (framing must be handled by application protocols like HTTP length headers or delimiter framing). Statement 5 is FALSE: TCP includes an explicit 16-bit header and payload checksum in its layer 4 header.',
    hints: [
      'Does TCP understand where one JSON string ends and another begins?',
      'Flow control protects the receiver; congestion control protects the network.',
    ],
    commonPitfalls: [
      'Thinking TCP preserves datagram message boundaries like UDP does.',
      'Confusing Flow Control (receiver window) with Congestion Control (network cwnd).',
    ],
  },

  // 3. Complexity Analysis: Nested Loop with Geometric Progression
  {
    id: 'q-complexity-geometric',
    type: 'complexity_analysis',
    title: 'Time Complexity of Doubling Outer and Geometric Inner Loop',
    prompt: `Analyze the tight asymptotic time complexity (Big-O) of the following code snippet with respect to input N:

\`\`\`python
def process_data(n):
    total = 0
    i = 1
    while i < n:
        j = 1
        while j < n:
            total += (i * j)
            j *= 2
        i *= 2
    return total
\`\`\`

What is the tightest upper bound O(f(N))?`,
    skills: ['Algorithms', 'Complexity Analysis'],
    difficulty: 'beginner',
    evidenceCategory: 'original_practice',
    gradingMethod: 'automatic',
    points: 10,
    options: [
      { id: 'opt-c-1', text: 'O(N^2)' },
      { id: 'opt-c-2', text: 'O(N log N)' },
      { id: 'opt-c-3', text: 'O((log N)^2)' },
      { id: 'opt-c-4', text: 'O(N)' },
    ],
    correctOptionId: 'opt-c-3',
    explanation: 'Notice both variables `i` and `j` start at 1 and are multiplied by 2 in each iteration (`i *= 2`, `j *= 2`). Therefore, the outer loop executes ceil(log2(N)) times. For every step of the outer loop, the inner loop also executes ceil(log2(N)) times. The total operations are log2(N) * log2(N) = O((log N)^2).',
    hints: [
      'Look at the loop update step: is it addition or multiplication?',
      'A loop that doubles its index takes logarithmic steps to reach N.',
    ],
    commonPitfalls: [
      'Assuming two nested loops always yield O(N^2) without checking the index update step.',
      'Confusing geometric iteration with linear increments.',
    ],
  },

  // 4. Output Prediction: JavaScript Event Loop & Microtasks
  {
    id: 'q-output-eventloop',
    type: 'output_prediction',
    title: 'JavaScript Event Loop: Promises, Microtasks, and Timers',
    prompt: `What is the exact printed console output order of the following JavaScript execution?

\`\`\`javascript
console.log('1');

setTimeout(() => {
  console.log('2');
}, 0);

Promise.resolve().then(() => {
  console.log('3');
}).then(() => {
  console.log('4');
});

console.log('5');
\`\`\``,
    skills: ['JavaScript', 'Concurrency', 'Browser Runtime'],
    difficulty: 'intermediate',
    evidenceCategory: 'original_practice',
    gradingMethod: 'automatic',
    points: 10,
    options: [
      { id: 'opt-ev-1', text: '1, 5, 3, 4, 2' },
      { id: 'opt-ev-2', text: '1, 2, 3, 4, 5' },
      { id: 'opt-ev-3', text: '1, 5, 2, 3, 4' },
      { id: 'opt-ev-4', text: '1, 3, 4, 5, 2' },
    ],
    correctOptionId: 'opt-ev-1',
    explanation: '1. Synchronous code executes first: "1" then "5" are logged. 2. `setTimeout` enqueues a callback into the macrotask/task queue. 3. `Promise.resolve().then()` enqueues a callback into the microtask queue. 4. At the end of the synchronous frame, the microtask queue is completely drained before moving to the next macrotask: "3" is logged, enqueuing the chained promise, which logs "4". 5. Finally, the event loop picks up the macrotask from `setTimeout`: logging "2". Result: 1, 5, 3, 4, 2.',
    hints: [
      'Synchronous code runs to completion before any queue is checked.',
      'The microtask queue (Promises) has strict priority over the macrotask queue (setTimeout, setInterval).',
    ],
    commonPitfalls: [
      'Thinking `setTimeout(..., 0)` executes immediately before pending microtasks.',
      'Believing promises are processed asynchronously in parallel background threads.',
    ],
  },

  // 5. Debugging: Binary Search Off-by-One Infinite Loop
  {
    id: 'q-debug-bsearch',
    type: 'debugging',
    title: 'Binary Search Edge-Case Infinite Loop',
    prompt: `A candidate submitted the following function to find the first index of \`target\` in a sorted array:

\`\`\`python
def find_first(nums, target):
    left = 0
    right = len(nums) - 1
    ans = -1
    
    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target:
            ans = mid
            right = mid  # Line 9
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
            
    return ans
\`\`\`

When testing with \`nums = [2, 2]\` and \`target = 2\`, the function hangs in an infinite loop. What is the correct bug fix on Line 9?`,
    skills: ['Algorithms', 'Debugging', 'Python'],
    difficulty: 'intermediate',
    evidenceCategory: 'original_practice',
    gradingMethod: 'automatic',
    points: 15,
    options: [
      { id: 'opt-dbg-1', text: 'Replace `right = mid` with `right = mid - 1`' },
      { id: 'opt-dbg-2', text: 'Change while loop condition to `while left < right:` and keep `right = mid`' },
      { id: 'opt-dbg-3', text: 'Change `mid = (left + right) // 2` to `mid = (left + right + 1) // 2`' },
      { id: 'opt-dbg-4', text: 'Replace `left = mid + 1` with `left = mid`' },
    ],
    correctOptionId: 'opt-dbg-1',
    explanation: 'Since `ans` has already captured `mid` (`ans = mid`), the search interval must strictly shrink to avoid infinite cycling. When `left = 0` and `right = 1`, `mid` is `0`. If `nums[0] == target`, setting `right = mid` leaves `left = 0, right = 0`. In the next iteration `mid = 0`, `nums[0] == target`, setting `right = 0` again, causing an infinite loop. Setting `right = mid - 1` ensures the search space strictly decreases while preserving earlier discovered answers in `ans`.',
    hints: [
      'Check what happens when `left == right` or when `right - left == 1`.',
      'If `ans` already recorded the current match, do you still need to keep `mid` inside the active search boundaries?',
    ],
    commonPitfalls: [
      'Keeping `mid` in both boundaries when an auxiliary variable already stores the candidate solution.',
      'Changing loop condition to `<` without verifying single-element edge cases.',
    ],
  },

  // 6. Short Answer / Numeric: Subnetting Usable Hosts
  {
    id: 'q-num-subnet',
    type: 'short_answer',
    title: 'IPv4 Usable Host Capacity in /26 CIDR Subnet',
    prompt: 'How many usable host IP addresses are available in an IPv4 subnet allocated with CIDR prefix `/26`? Enter only the integer number.',
    skills: ['Networks', 'System Administration'],
    difficulty: 'beginner',
    evidenceCategory: 'original_practice',
    gradingMethod: 'automatic',
    points: 10,
    acceptedVariants: ['62', '62 hosts', '62 ips'],
    isCaseSensitive: false,
    explanation: 'An IPv4 address has 32 bits. A /26 subnet leaves 32 - 26 = 6 bits for host addressing. Total addresses = 2^6 = 64. In standard IPv4 networking, 2 addresses are reserved: the network identifier (all host bits 0) and the broadcast address (all host bits 1). Therefore, usable host addresses = 64 - 2 = 62.',
    hints: [
      'Calculate the number of host bits: 32 - prefix length.',
      'Subtract the network identifier and the broadcast address.',
    ],
    commonPitfalls: [
      'Forgetting to subtract the 2 reserved addresses (submitting 64 instead of 62).',
      'Confusing /26 (64 total) with /27 (32 total).',
    ],
  },

  // 7. SQL: Second Highest Salary with Relational Verification
  {
    id: 'q-sql-salary',
    type: 'sql',
    title: 'Second Highest Distinct Salary in Employee Table',
    prompt: `Write a standard SQL query to find the second highest distinct salary from the \`Employee\` table. If there is no second highest salary (e.g. only 1 employee or all employees share the same salary), the query should return \`NULL\` under the column alias \`SecondHighestSalary\`.

Table schema:
\`\`\`sql
CREATE TABLE Employee (
  id INT PRIMARY KEY,
  salary INT NOT NULL
);
\`\`\``,
    skills: ['SQL', 'Databases'],
    difficulty: 'intermediate',
    evidenceCategory: 'original_practice',
    gradingMethod: 'self_review',
    points: 15,
    sqlFixture: {
      schemaSql: 'CREATE TABLE Employee (id INT PRIMARY KEY, salary INT NOT NULL);',
      seedSql: 'INSERT INTO Employee (id, salary) VALUES (1, 100), (2, 200), (3, 300);',
      expectedResultJson: JSON.stringify([{ SecondHighestSalary: 200 }]),
    },
    codeStarter: `-- Write your SQL query here\nSELECT (\n  SELECT DISTINCT salary \n  FROM Employee\n  -- complete query\n) AS SecondHighestSalary;`,
    explanation: `Two primary standard SQL approaches handle the NULL edge case gracefully:

**Approach 1: Subquery with LIMIT / OFFSET**
\`\`\`sql
SELECT (
  SELECT DISTINCT salary 
  FROM Employee 
  ORDER BY salary DESC 
  LIMIT 1 OFFSET 1
) AS SecondHighestSalary;
\`\`\`
Wrapping the inner query in a \`SELECT (...)\` scalar projection guarantees that an empty inner result set evaluates to SQL \`NULL\` instead of returning 0 rows.

**Approach 2: Max with Subquery**
\`\`\`sql
SELECT MAX(salary) AS SecondHighestSalary
FROM Employee
WHERE salary < (SELECT MAX(salary) FROM Employee);
\`\`\`
When no salary is strictly less than the maximum, \`MAX()\` naturally returns \`NULL\`.`,
    hints: [
      'Consider what happens if all employees earn the exact same salary.',
      'Using a scalar subquery `SELECT (SELECT ...) AS alias` automatically yields NULL when the inner query returns no rows.',
    ],
    commonPitfalls: [
      'Using `LIMIT 1 OFFSET 1` directly without a wrapping scalar subquery returns an empty result set (0 rows) instead of 1 row with NULL value.',
      'Forgetting `DISTINCT`, which fails if multiple employees share the top salary.',
    ],
  },

  // 8. Coding: Sliding Window Longest Substring Without Repeating Characters
  {
    id: 'q-code-slidingwindow',
    type: 'coding',
    title: 'Longest Substring Without Repeating Characters',
    prompt: `Given a string \`s\`, find the length of the longest substring without duplicate characters.

**Constraints:**
- \`0 <= s.length <= 5 * 10^4\`
- \`s\` consists of English letters, digits, symbols, and spaces.
- Target time complexity: O(N) where N is length of \`s\`. Space complexity: O(min(N, M)) where M is alphabet size.

**Example 1:**
- Input: \`s = "abcabcbb"\`
- Output: \`3\` (The answer is \`"abc"\`, length 3)

**Example 2:**
- Input: \`s = "bbbbb"\`
- Output: \`1\`

**Example 3:**
- Input: \`s = "pwwkew"\`
- Output: \`3\` (\`"wke"\`, notice \`"pwke"\` is a subsequence, not a contiguous substring)`,
    skills: ['Algorithms', 'Data Structures', 'Strings', 'Sliding Window'],
    difficulty: 'intermediate',
    evidenceCategory: 'original_practice',
    gradingMethod: 'self_review',
    points: 20,
    language: 'python',
    codeStarter: `def length_of_longest_substring(s: str) -> int:
    # Implement sliding window algorithm
    pass
`,
    codeSolution: `def length_of_longest_substring(s: str) -> int:
    char_index_map = {}
    max_len = 0
    left = 0
    
    for right, char in enumerate(s):
        if char in char_index_map and char_index_map[char] >= left:
            left = char_index_map[char] + 1
        char_index_map[char] = right
        max_len = max(max_len, right - left + 1)
        
    return max_len`,
    testCases: [
      { id: 'tc-1', input: '"abcabcbb"', expectedOutput: '3', description: 'Standard repeating characters' },
      { id: 'tc-2', input: '"bbbbb"', expectedOutput: '1', description: 'All identical characters' },
      { id: 'tc-3', input: '"pwwkew"', expectedOutput: '3', description: 'Subsequence vs substring distinction' },
      { id: 'tc-4', input: '""', expectedOutput: '0', description: 'Empty string edge case' },
      { id: 'tc-5', input: '"tmmzuxt"', expectedOutput: '5', description: 'Window left-pointer jump condition' },
    ],
    explanation: 'Using the sliding window technique with a hash map of character-to-last-seen-index: When a duplicate character is encountered, advance the `left` boundary to `last_seen_index + 1` (only if the recorded index is currently within the active window, i.e., `last_seen_index >= left`). This achieves optimal O(N) single-pass runtime.',
    hints: [
      'Maintain a window `[left, right]` where all characters are distinct.',
      'When you see a repeated character, make sure you only advance `left` forward—never jump backwards.',
    ],
    commonPitfalls: [
      'Advancing `left` by only 1 index instead of jumping past the previous occurrence.',
      'Failing to check `char_index_map[char] >= left`, causing the left pointer to erroneously move backwards.',
    ],
  },

  // 9. Written Response: Consistency & Scalability Tradeoffs (Rubric-Graded)
  {
    id: 'q-written-dbtradeoffs',
    type: 'written_response',
    title: 'Architectural Trade-offs: Relational (PostgreSQL) vs Document (MongoDB) for E-Commerce Checkout',
    prompt: `You are designing the storage layer for an e-commerce checkout system handling inventory reservations and payment records. 
Analyze the architectural trade-offs between adopting a strictly relational database (e.g. PostgreSQL with ACID serializable transactions) versus a horizontally partitioned document store (e.g. MongoDB with eventual consistency / replica sets).

Address these specific aspects:
1. **Inventory Atomicity & Overselling Prevention:** How transaction isolation prevents race conditions during flash sales.
2. **Schema Evolution:** How product variations and evolving catalog attributes are represented.
3. **Partitioning & Operational Scaling:** Trade-offs between vertical scaling / read-replicas vs distributed sharding.`,
    skills: ['System Design', 'Databases', 'Distributed Systems'],
    difficulty: 'advanced',
    evidenceCategory: 'original_practice',
    gradingMethod: 'self_review',
    points: 20,
    rubricCriteria: [
      {
        id: 'rubric-1',
        label: 'Concurrency & Transaction Isolation',
        maxPoints: 8,
        description: 'Candidate accurately explains how SELECT FOR UPDATE or Repeatable Read/Serializable isolation prevents lost updates and overselling under concurrent checkout requests.',
      },
      {
        id: 'rubric-2',
        label: 'Catalog Schema vs Transactional Demarcation',
        maxPoints: 6,
        description: 'Candidate distinguishes transactional checkout/orders (relational integrity) from product catalog display (document flexibility), and discusses polyglot persistence.',
      },
      {
        id: 'rubric-3',
        label: 'Scaling & Distributed Failure Modes',
        maxPoints: 6,
        description: 'Candidate evaluates multi-shard distributed transaction latency vs single-primary replication limits, and mentions split-brain or network partition implications.',
      },
    ],
    explanation: `**Key Reference Architecture Points:**
1. **Overselling Prevention:** A relational engine with \`SELECT ... FOR UPDATE\` or optimistic locking (\`WHERE version = @current\`) prevents race conditions where two concurrent requests read inventory = 1 and both proceed. In distributed document stores without multi-document transactions across shards, preventing overselling requires atomic \`findAndModify\` with negative quantity guards (\`quantity >= 1\`).
2. **Polyglot Persistence:** Industry standard architectures often decouple the product catalog (stored in Document or search indices for dynamic attributes) from the checkout/order ledger (stored in strict relational DB with foreign keys and ACID constraints).
3. **Operational Scaling:** Relational databases scale vertically easily and scale reads via read replicas, but require cross-table partition keys for sharding. Document stores shard easily on high-cardinality keys, but distributed cross-shard transactions introduce 2PC (Two-Phase Commit) latency penalties.`,
    hints: [
      'Focus on what happens when 1,000 customers click "Buy Now" simultaneously for the last item in stock.',
      'Can you use both databases for different sub-domains within the checkout lifecycle?',
    ],
    commonPitfalls: [
      'Claiming NoSQL databases cannot handle transactions at all (modern versions support single-document atomicity and scoped multi-document transactions).',
      'Ignoring the performance overhead of 2-Phase Commit (2PC) over distributed network partitions.',
    ],
  },
];
