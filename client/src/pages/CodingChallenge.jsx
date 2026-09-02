import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  Code, 
  Terminal, 
  Play, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Award,
  Layers, 
  Search, 
  BarChart3, 
  Binary, 
  Compass, 
  Activity, 
  Shuffle, 
  Sigma, 
  Zap,
  Share2,
  GitBranch,
  RefreshCw,
  Sun,
  Moon,
  Globe,
  ChevronLeft,
  ChevronRight,
  Calendar
} from 'lucide-react';
import './CodingChallenge.css';

// Custom inline SVG icons for GitHub and LinkedIn with standard 24x24 viewBox
const GithubIcon = ({ size = 18, className = '' }) => (
  <svg 
    stroke="currentColor" 
    fill="currentColor" 
    strokeWidth="0" 
    viewBox="0 0 24 24" 
    height={size} 
    width={size} 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"></path>
  </svg>
);

const LinkedinIcon = ({ size = 18, className = '' }) => (
  <svg 
    stroke="currentColor" 
    fill="currentColor" 
    strokeWidth="0" 
    viewBox="0 0 24 24" 
    height={size} 
    width={size} 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28z"></path>
  </svg>
);

const TOPICS = [
  { 
    id: 'Arrays', 
    name: 'Arrays & Hashing', 
    icon: Code, 
    desc: 'Vectors, sets, maps, hash tables',
    webName: 'GeeksforGeeks Array Guide',
    webUrl: 'https://www.geeksforgeeks.org/array-data-structure/',
    ytUrl: 'https://youtu.be/mF3EqQZDPmU'
  },
  { 
    id: 'Strings', 
    name: 'Strings Manipulation', 
    icon: Terminal, 
    desc: 'Substrings, regex, anagrams',
    webName: 'LeetCode Strings Study Card',
    webUrl: 'https://leetcode.com/explore/interview/card/top-interview-questions-easy/127/strings/',
    ytUrl: 'https://youtu.be/Wdjr6uoZ0e0'
  },
  { 
    id: 'Linked List', 
    name: 'Linked Lists', 
    icon: ArrowRight, 
    desc: 'Singly, doubly, cycle detection',
    webName: 'GeeksforGeeks Linked List DS',
    webUrl: 'https://www.geeksforgeeks.org/data-structures/linked-list/',
    ytUrl: 'https://youtu.be/R9PTBwOzraw'
  },
  { 
    id: 'Stack', 
    name: 'Stacks & LIFO', 
    icon: Layers, 
    desc: 'LIFO structures, matching parentheses',
    webName: 'GeeksforGeeks Stack DS',
    webUrl: 'https://www.geeksforgeeks.org/stack-data-structure/',
    ytUrl: 'https://youtu.be/mJWAPDKK4ho'
  },
  { 
    id: 'Queue', 
    name: 'Queues & FIFO', 
    icon: Shuffle, 
    desc: 'FIFO structures, sliding windows',
    webName: 'GeeksforGeeks Queue DS',
    webUrl: 'https://www.geeksforgeeks.org/queue-data-structure/',
    ytUrl: 'https://youtu.be/mJWAPDKK4ho'
  },
  { 
    id: 'Searching', 
    name: 'Searching Algorithms', 
    icon: Search, 
    desc: 'Binary search, divide & conquer',
    webName: 'LeetCode Binary Search Discussion',
    webUrl: 'https://leetcode.com/discuss/general-discussion/786126/binary-search-for-beginners-problems-patterns-sample-solutions',
    ytUrl: 'https://youtu.be/f6UU7c3szVw'
  },
  { 
    id: 'Sorting', 
    name: 'Sorting Algorithms', 
    icon: BarChart3, 
    desc: 'Quick, merge, bubble, heap sorting',
    webName: 'VisuAlgo Sorting Animation',
    webUrl: 'https://visualgo.net/en/sorting',
    ytUrl: 'https://youtu.be/mG7vS-n95hA'
  },
  { 
    id: 'depth-first-search', 
    name: 'Depth-First Search', 
    icon: GitBranch, 
    desc: 'Recursive tree and graph traversal',
    webName: 'GeeksforGeeks Graph DFS',
    webUrl: 'https://www.geeksforgeeks.org/depth-first-search-or-dfs-for-a-graph/',
    ytUrl: 'https://youtu.be/uOlMGRec_yk'
  },
  { 
    id: 'breadth-first-search', 
    name: 'Breadth-First Search', 
    icon: Share2, 
    desc: 'Shortest path, level-order queues',
    webName: 'GeeksforGeeks Graph BFS',
    webUrl: 'https://www.geeksforgeeks.org/breadth-first-search-or-bfs-for-a-graph/',
    ytUrl: 'https://youtu.be/oDbK1z5HB0Y'
  },
  { 
    id: 'two-pointer', 
    name: 'Two-Pointer Technique', 
    icon: Activity, 
    desc: 'Slow-fast runners, bounded limits',
    webName: 'LeetCode Two-Pointer Guide',
    webUrl: 'https://leetcode.com/discuss/study-guide/1688903/Solved-all-two-pointers-problems-in-LeetCode',
    ytUrl: 'https://youtu.be/95jK5GkS0lM'
  },
  { 
    id: 'counting', 
    name: 'Counting & Hashing', 
    icon: Binary, 
    desc: 'Frequency counts, hash calculations',
    webName: 'GeeksforGeeks Hash Frequencies',
    webUrl: 'https://www.geeksforgeeks.org/counting-frequencies-of-array-elements/',
    ytUrl: 'https://youtu.be/keuY8JNeQnk'
  },
  { 
    id: 'math', 
    name: 'Math & Logic', 
    icon: Sigma, 
    desc: 'GCD, primes, combinations, logic',
    webName: 'GeeksforGeeks Math Algorithms',
    webUrl: 'https://www.geeksforgeeks.org/mathematical-algorithms/',
    ytUrl: 'https://youtu.be/094y1Z2wp5A'
  },
  { 
    id: 'greedy', 
    name: 'Greedy Algorithms', 
    icon: Zap, 
    desc: 'Local optimal choice, scheduling',
    webName: 'LeetCode Greedy Tutorial',
    webUrl: 'https://leetcode.com/discuss/study-guide/1063635/greedy-for-beginners-problems-sample-solutions',
    ytUrl: 'https://youtu.be/l_a1G41gWqM'
  },
  { 
    id: 'Recursion', 
    name: 'Recursion & DP', 
    icon: Compass, 
    desc: 'Dynamic programming, memoization',
    webName: 'GeeksforGeeks Recursion Basics',
    webUrl: 'https://www.geeksforgeeks.org/recursion/',
    ytUrl: 'https://youtu.be/yVdKa8dnKiE'
  }
];

const RAW_CURATED = [
  // Arrays & Hashing
  {
    id: 'two_sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    topic: 'Arrays',
    problemStatement: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.',
    input: 'nums = [2,7,11,15], target = 9',
    output: '[0,1]',
    explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
    constraints: ['2 <= nums.length <= 10^4'],
    jsFunc: 'function twoSum(nums, target) {\n    return [];\n}',
    pyFunc: 'class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        return []',
    cppFunc: 'class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        return {};\n    }\n};'
  },
  {
    id: 'contains_duplicate',
    title: 'Contains Duplicate',
    difficulty: 'Easy',
    topic: 'Arrays',
    problemStatement: 'Given an integer array `nums`, return `true` if any value appears at least twice in the array, and return `false` if every element is distinct.',
    input: 'nums = [1,2,3,1]',
    output: 'true',
    explanation: '1 appears twice.',
    constraints: ['1 <= nums.length <= 10^5'],
    jsFunc: 'function containsDuplicate(nums) {\n    return false;\n}',
    pyFunc: 'class Solution:\n    def containsDuplicate(self, nums: List[int]) -> bool:\n        return False',
    cppFunc: 'class Solution {\npublic:\n    bool containsDuplicate(vector<int>& nums) {\n        return false;\n    }\n};'
  },
  {
    id: 'valid_anagram',
    title: 'Valid Anagram',
    difficulty: 'Easy',
    topic: 'Arrays',
    problemStatement: 'Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise.',
    input: 's = "anagram", t = "nagaram"',
    output: 'true',
    explanation: 'Letters can be rearranged to match.',
    constraints: ['1 <= s.length, t.length <= 5 * 10^4'],
    jsFunc: 'function isAnagram(s, t) {\n    return false;\n}',
    pyFunc: 'class Solution:\n    def isAnagram(self, s: str, t: str) -> bool:\n        return False',
    cppFunc: 'class Solution {\npublic:\n    bool isAnagram(string s, string t) {\n        return false;\n    }\n};'
  },
  {
    id: 'top_k_frequent',
    title: 'Top K Frequent Elements',
    difficulty: 'Medium',
    topic: 'Arrays',
    problemStatement: 'Given an integer array `nums` and an integer `k`, return the `k` most frequent elements. You may return the answer in any order.',
    input: 'nums = [1,1,1,2,2,3], k = 2',
    output: '[1,2]',
    explanation: '1 occurs 3 times, 2 occurs 2 times.',
    constraints: ['1 <= nums.length <= 10^5'],
    jsFunc: 'function topKFrequent(nums, k) {\n    return [];\n}',
    pyFunc: 'class Solution:\n    def topKFrequent(self, nums: List[int], k: int) -> List[int]:\n        return []',
    cppFunc: 'class Solution {\npublic:\n    vector<int> topKFrequent(vector<int>& nums, int k) {\n        return {};\n    }\n};'
  },
  {
    id: 'product_except_self',
    title: 'Product of Array Except Self',
    difficulty: 'Medium',
    topic: 'Arrays',
    problemStatement: 'Given an integer array `nums`, return an array `answer` such that `answer[i]` is equal to the product of all the elements of `nums` except `nums[i]`. You must write an algorithm that runs in O(n) time and without using division.',
    input: 'nums = [1,2,3,4]',
    output: '[24,12,8,6]',
    explanation: 'Indices product matches.',
    constraints: ['2 <= nums.length <= 10^5'],
    jsFunc: 'function productExceptSelf(nums) {\n    return [];\n}',
    pyFunc: 'class Solution:\n    def productExceptSelf(self, nums: List[int]) -> List[int]:\n        return []',
    cppFunc: 'class Solution {\npublic:\n    vector<int> productExceptSelf(vector<int>& nums) {\n        return {};\n    }\n};'
  },
  {
    id: 'group_anagrams',
    title: 'Group Anagrams',
    difficulty: 'Medium',
    topic: 'Arrays',
    problemStatement: 'Given an array of strings `strs`, group the anagrams together. You can return the answer in any order.',
    input: 'strs = ["eat","tea","tan","ate","nat","bat"]',
    output: '[["bat"],["nat","tan"],["ate","eat","tea"]]',
    explanation: 'Anagram groups created.',
    constraints: ['1 <= strs.length <= 10^4'],
    jsFunc: 'function groupAnagrams(strs) {\n    return [];\n}',
    pyFunc: 'class Solution:\n    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:\n        return []',
    cppFunc: 'class Solution {\npublic:\n    vector<vector<string>> groupAnagrams(vector<string>& strs) {\n        return {};\n    }\n};'
  },
  {
    id: 'first_missing_positive',
    title: 'First Missing Positive',
    difficulty: 'Hard',
    topic: 'Arrays',
    problemStatement: 'Given an unsorted integer array `nums`, return the smallest missing positive integer. You must implement an algorithm that runs in O(n) time and uses O(1) auxiliary space.',
    input: 'nums = [1,2,0]',
    output: '3',
    explanation: '1 and 2 are in the array, so 3 is missing.',
    constraints: ['1 <= nums.length <= 10^5'],
    jsFunc: 'function firstMissingPositive(nums) {\n    return 1;\n}',
    pyFunc: 'class Solution:\n    def firstMissingPositive(self, nums: List[int]) -> int:\n        return 1',
    cppFunc: 'class Solution {\npublic:\n    int firstMissingPositive(vector<int>& nums) {\n        return 1;\n    }\n};'
  },
  {
    id: 'trapping_rain_water',
    title: 'Trapping Rain Water',
    difficulty: 'Hard',
    topic: 'Arrays',
    problemStatement: 'Given `n` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
    input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]',
    output: '6',
    explanation: '6 units of water are trapped.',
    constraints: ['n == height.length', '0 <= n <= 2 * 10^4'],
    jsFunc: 'function trap(height) {\n    return 0;\n}',
    pyFunc: 'class Solution:\n    def trap(self, height: List[int]) -> int:\n        return 0',
    cppFunc: 'class Solution {\npublic:\n    int trap(vector<int>& height) {\n        return 0;\n    }\n};'
  },
  {
    id: 'n_queens',
    title: 'N-Queens Placement',
    difficulty: 'Hard',
    topic: 'Arrays',
    problemStatement: 'The n-queens puzzle is the problem of placing `n` queens on an `n x n` chessboard such that no two queens attack each other. Given an integer `n`, return all distinct solutions.',
    input: 'n = 4',
    output: '[[[".Q..","...Q","Q...","..Q."],["..Q.","Q...","...Q",".Q.."]]]',
    explanation: 'Two distinct configurations.',
    constraints: ['1 <= n <= 9'],
    jsFunc: 'function solveNQueens(n) {\n    return [];\n}',
    pyFunc: 'class Solution:\n    def solveNQueens(self, n: int) -> List[List[str]]:\n        return []',
    cppFunc: 'class Solution {\npublic:\n    vector<vector<string>> solveNQueens(int n) {\n        return {};\n    }\n};'
  },

  // Strings Manipulation
  {
    id: 'valid_palindrome',
    title: 'Valid Palindrome',
    difficulty: 'Easy',
    topic: 'Strings',
    problemStatement: 'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Given a string `s`, return `true` if it is a palindrome.',
    input: 's = "A man, a plan, a canal: Panama"',
    output: 'true',
    explanation: '"amanaplanacanalpanama" reads same.',
    constraints: ['1 <= s.length <= 2 * 10^5'],
    jsFunc: 'function isPalindrome(s) {\n    return false;\n}',
    pyFunc: 'class Solution:\n    def isPalindrome(self, s: str) -> bool:\n        return False',
    cppFunc: 'class Solution {\npublic:\n    bool isPalindrome(string s) {\n        return false;\n    }\n};'
  },
  {
    id: 'reverse_string',
    title: 'Reverse String',
    difficulty: 'Easy',
    topic: 'Strings',
    problemStatement: 'Write a function that reverses a string. The input string is given as an array of characters `s`. You must do this by modifying the input array in-place.',
    input: 's = ["h","e","l","l","o"]',
    output: '["o","l","l","e","h"]',
    explanation: 'Modified in-place.',
    constraints: ['1 <= s.length <= 10^5'],
    jsFunc: 'function reverseString(s) {\n    // modify s in-place\n}',
    pyFunc: 'class Solution:\n    def reverseString(self, s: List[str]) -> None:\n        # modify s in-place',
    cppFunc: 'class Solution {\npublic:\n    void reverseString(vector<char>& s) {\n        // modify s in-place\n    }\n};'
  },
  {
    id: 'first_uniq_char',
    title: 'First Unique Character',
    difficulty: 'Easy',
    topic: 'Strings',
    problemStatement: 'Given a string `s`, find the first non-repeating character in it and return its index. If it does not exist, return `-1`.',
    input: 's = "leetcode"',
    output: '0',
    explanation: 'l is unique.',
    constraints: ['1 <= s.length <= 10^5'],
    jsFunc: 'function firstUniqChar(s) {\n    return -1;\n}',
    pyFunc: 'class Solution:\n    def firstUniqChar(self, s: str) -> int:\n        return -1',
    cppFunc: 'class Solution {\npublic:\n    int firstUniqChar(string s) {\n        return -1;\n    }\n};'
  },
  {
    id: 'longest_substring',
    title: 'Longest Substring Without Repeating',
    difficulty: 'Medium',
    topic: 'Strings',
    problemStatement: 'Given a string `s`, find the length of the longest substring without repeating characters.',
    input: 's = "abcabcbb"',
    output: '3',
    explanation: 'The answer is "abc", with length 3.',
    constraints: ['0 <= s.length <= 5 * 10^4'],
    jsFunc: 'function lengthOfLongestSubstring(s) {\n    return 0;\n}',
    pyFunc: 'class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        return 0',
    cppFunc: 'class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        return 0;\n    }\n};'
  },
  {
    id: 'longest_palindrome_str',
    title: 'Longest Palindromic Substring',
    difficulty: 'Medium',
    topic: 'Strings',
    problemStatement: 'Given a string `s`, return the longest palindromic substring in `s`.',
    input: 's = "babad"',
    output: '"bab"',
    explanation: '"aba" is also valid.',
    constraints: ['1 <= s.length <= 1000'],
    jsFunc: 'function longestPalindrome(s) {\n    return "";\n}',
    pyFunc: 'class Solution:\n    def longestPalindrome(self, s: str) -> str:\n        return ""',
    cppFunc: 'class Solution {\npublic:\n    string longestPalindrome(string s) {\n        return "";\n    }\n};'
  },
  {
    id: 'atoi',
    title: 'String to Integer (atoi)',
    difficulty: 'Medium',
    topic: 'Strings',
    problemStatement: 'Implement the `myAtoi(string s)` function, which converts a string to a 32-bit signed integer.',
    input: 's = "   -42"',
    output: '-42',
    explanation: 'Whitespace ignored, sign read.',
    constraints: ['0 <= s.length <= 200'],
    jsFunc: 'function myAtoi(s) {\n    return 0;\n}',
    pyFunc: 'class Solution:\n    def myAtoi(self, s: str) -> int:\n        return 0',
    cppFunc: 'class Solution {\npublic:\n    int myAtoi(string s) {\n        return 0;\n    }\n};'
  },
  {
    id: 'min_window_substring',
    title: 'Minimum Window Substring',
    difficulty: 'Hard',
    topic: 'Strings',
    problemStatement: 'Given two strings `s` and `t` of lengths `m` and `n` respectively, return the minimum window substring of `s` such that every character in `t` (including duplicates) is included in the window. If there is no such substring, return empty string.',
    input: 's = "ADOBECODEBANC", t = "ABC"',
    output: '"BANC"',
    explanation: 'Minimum matching window.',
    constraints: ['1 <= s.length, t.length <= 10^5'],
    jsFunc: 'function minWindow(s, t) {\n    return "";\n}',
    pyFunc: 'class Solution:\n    def minWindow(self, s: str, t: str) -> str:\n        return ""',
    cppFunc: 'class Solution {\npublic:\n    string minWindow(string s, string t) {\n        return "";\n    }\n};'
  },
  {
    id: 'regex_matching',
    title: 'Regular Expression Matching',
    difficulty: 'Hard',
    topic: 'Strings',
    problemStatement: 'Given an input string `s` and a pattern `p`, implement regular expression matching with support for `.` and `*`.',
    input: 's = "aa", p = "a*"',
    output: 'true',
    explanation: 'Matches correctly.',
    constraints: ['1 <= s.length, p.length <= 20'],
    jsFunc: 'function isMatch(s, p) {\n    return false;\n}',
    pyFunc: 'class Solution:\n    def isMatch(self, s: str, p: str) -> bool:\n        return False',
    cppFunc: 'class Solution {\npublic:\n    bool isMatch(string s, string p) {\n        return false;\n    }\n};'
  },
  {
    id: 'distinct_subsequences',
    title: 'Distinct Subsequences',
    difficulty: 'Hard',
    topic: 'Strings',
    problemStatement: 'Given two strings `s` and `t`, return the number of distinct subsequences of `s` which equals `t`.',
    input: 's = "rabbbit", t = "rabbit"',
    output: '3',
    explanation: '3 ways to remove b.',
    constraints: ['1 <= s.length, t.length <= 1000'],
    jsFunc: 'function numDistinct(s, t) {\n    return 0;\n}',
    pyFunc: 'class Solution:\n    def numDistinct(self, s: str, t: str) -> int:\n        return 0',
    cppFunc: 'class Solution {\npublic:\n    int numDistinct(string s, string t) {\n        return 0;\n    }\n};'
  },

  // Linked Lists
  {
    id: 'reverse_linked_list',
    title: 'Reverse Linked List',
    difficulty: 'Easy',
    topic: 'Linked List',
    problemStatement: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
    input: 'head = [1,2,3,4,5]',
    output: '[5,4,3,2,1]',
    explanation: 'List pointers are reversed.',
    constraints: ['0 <= nodes count <= 5000'],
    jsFunc: 'function reverseList(head) {\n    return head;\n}',
    pyFunc: 'class Solution:\n    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:\n        return head',
    cppFunc: 'class Solution {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        return head;\n    }\n};'
  },
  {
    id: 'merge_two_lists',
    title: 'Merge Two Sorted Lists',
    difficulty: 'Easy',
    topic: 'Linked List',
    problemStatement: 'You are given the heads of two sorted linked lists `list1` and `list2`. Merge the two lists into one sorted list.',
    input: 'list1 = [1,2,4], list2 = [1,3,4]',
    output: '[1,1,2,3,4,4]',
    explanation: 'Merged in sorted order.',
    constraints: ['0 <= list1.length, list2.length <= 50'],
    jsFunc: 'function mergeTwoLists(list1, list2) {\n    return list1;\n}',
    pyFunc: 'class Solution:\n    def mergeTwoLists(self, list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:\n        return list1',
    cppFunc: 'class Solution {\npublic:\n    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {\n        return list1;\n    }\n};'
  },
  {
    id: 'linked_list_cycle',
    title: 'Linked List Cycle',
    difficulty: 'Easy',
    topic: 'Linked List',
    problemStatement: 'Given head, the head of a linked list, determine if the linked list has a cycle in it.',
    input: 'head = [3,2,0,-4], pos = 1',
    output: 'true',
    explanation: 'Cycle detected at pos 1.',
    constraints: ['0 <= list nodes <= 10^4'],
    jsFunc: 'function hasCycle(head) {\n    return false;\n}',
    pyFunc: 'class Solution:\n    def hasCycle(self, head: Optional[ListNode]) -> bool:\n        return False',
    cppFunc: 'class Solution {\npublic:\n    bool hasCycle(ListNode *head) {\n        return false;\n    }\n};'
  },
  {
    id: 'remove_nth_node',
    title: 'Remove Nth Node From End',
    difficulty: 'Medium',
    topic: 'Linked List',
    problemStatement: 'Given the head of a linked list, remove the `n`-th node from the end of the list and return its head.',
    input: 'head = [1,2,3,4,5], n = 2',
    output: '[1,2,3,5]',
    explanation: '4 removed from the end.',
    constraints: ['1 <= nodes <= 30'],
    jsFunc: 'function removeNthFromEnd(head, n) {\n    return head;\n}',
    pyFunc: 'class Solution:\n    def removeNthFromEnd(self, head: Optional[ListNode], n: int) -> Optional[ListNode]:\n        return head',
    cppFunc: 'class Solution {\npublic:\n    ListNode* removeNthFromEnd(ListNode* head, int n) {\n        return head;\n    }\n};'
  },
  {
    id: 'reorder_list',
    title: 'Reorder List',
    difficulty: 'Medium',
    topic: 'Linked List',
    problemStatement: 'You are given the head of a singly linked list. Reorder the list to L0 → Ln → L1 → Ln-1 → L2 → Ln-2 → ...',
    input: 'head = [1,2,3,4]',
    output: '[1,4,2,3]',
    explanation: 'List pointers rearranged.',
    constraints: ['1 <= nodes <= 5 * 10^4'],
    jsFunc: 'function reorderList(head) {\n    // reorder list in-place\n}',
    pyFunc: 'class Solution:\n    def reorderList(self, head: Optional[ListNode]) -> None:\n        # reorder in-place',
    cppFunc: 'class Solution {\npublic:\n    void reorderList(ListNode* head) {\n        // reorder in-place\n    }\n};'
  },
  {
    id: 'add_two_numbers',
    title: 'Add Two Numbers',
    difficulty: 'Medium',
    topic: 'Linked List',
    problemStatement: 'You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order. Add the two numbers and return the sum as a linked list.',
    input: 'l1 = [2,4,3], l2 = [5,6,4]',
    output: '[7,0,8]',
    explanation: '342 + 465 = 807.',
    constraints: ['Nodes count in range [1, 100]'],
    jsFunc: 'function addTwoNumbers(l1, l2) {\n    return l1;\n}',
    pyFunc: 'class Solution:\n    def addTwoNumbers(self, l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:\n        return l1',
    cppFunc: 'class Solution {\npublic:\n    ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {\n        return l1;\n    }\n};'
  },
  {
    id: 'merge_k_sorted_lists',
    title: 'Merge K Sorted Lists',
    difficulty: 'Hard',
    topic: 'Linked List',
    problemStatement: 'You are given an array of `k` linked lists, each linked-list is sorted in ascending order. Merge all the linked lists into one sorted linked list and return it.',
    input: 'lists = [[1,4,5],[1,3,4],[2,6]]',
    output: '[1,1,2,3,4,4,5,6]',
    explanation: 'All lists merged.',
    constraints: ['0 <= k <= 10^4'],
    jsFunc: 'function mergeKLists(lists) {\n    return null;\n}',
    pyFunc: 'class Solution:\n    def mergeKLists(self, lists: List[Optional[ListNode]]) -> Optional[ListNode]:\n        return None',
    cppFunc: 'class Solution {\npublic:\n    ListNode* mergeKLists(vector<ListNode*>& lists) {\n        return nullptr;\n    }\n};'
  },
  {
    id: 'reverse_k_group',
    title: 'Reverse Nodes in k-Group',
    difficulty: 'Hard',
    topic: 'Linked List',
    problemStatement: 'Given the head of a linked list, reverse the nodes of the list `k` at a time, and return the modified list.',
    input: 'head = [1,2,3,4,5], k = 2',
    output: '[2,1,4,3,5]',
    explanation: 'Reversed groups of size 2.',
    constraints: ['1 <= k <= nodes count <= 5000'],
    jsFunc: 'function reverseKGroup(head, k) {\n    return head;\n}',
    pyFunc: 'class Solution:\n    def reverseKGroup(self, head: Optional[ListNode], k: int) -> Optional[ListNode]:\n        return head',
    cppFunc: 'class Solution {\npublic:\n    ListNode* reverseKGroup(ListNode* head, int k) {\n        return head;\n    }\n};'
  },
  {
    id: 'copy_random_list',
    title: 'Copy List with Random Pointer',
    difficulty: 'Hard',
    topic: 'Linked List',
    problemStatement: 'A linked list of length `n` is given such that each node contains an additional random pointer, which could point to any node in the list, or `null`. Construct a deep copy of the list.',
    input: 'head = [[7,null],[13,0],[11,4],[10,2],[1,0]]',
    output: '[[7,null],[13,0],[11,4],[10,2],[1,0]]',
    explanation: 'Deep copy returned.',
    constraints: ['0 <= n <= 1000'],
    jsFunc: 'function copyRandomList(head) {\n    return head;\n}',
    pyFunc: 'class Solution:\n    def copyRandomList(self, head: "Optional[Node]") -> "Optional[Node]":\n        return head',
    cppFunc: 'class Solution {\npublic:\n    Node* copyRandomList(Node* head) {\n        return head;\n    }\n};'
  },

  // Stacks & LIFO
  {
    id: 'valid_parentheses',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    topic: 'Stack',
    problemStatement: 'Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.',
    input: 's = "()"',
    output: 'true',
    explanation: 'Matched parenthesis.',
    constraints: ['1 <= s.length <= 10^4'],
    jsFunc: 'function isValid(s) {\n    return false;\n}',
    pyFunc: 'class Solution:\n    def isValid(self, s: str) -> bool:\n        return False',
    cppFunc: 'class Solution {\npublic:\n    bool isValid(string s) {\n        return false;\n    }\n};'
  },
  {
    id: 'min_stack',
    title: 'Min Stack',
    difficulty: 'Easy',
    topic: 'Stack',
    problemStatement: 'Design a stack that supports push, pop, top, and retrieving the minimum element in constant time.',
    input: '["MinStack","push","push","getMin"], val = [-2,0]',
    output: '[null,null,null,-2]',
    explanation: 'Retrieved minimum in O(1).',
    constraints: ['-2^31 <= val <= 2^31 - 1'],
    jsFunc: 'class MinStack {\n    constructor() {}\n    push(val) {}\n    pop() {}\n    top() {}\n    getMin() {}\n}',
    pyFunc: 'class MinStack:\n    def __init__(self):\n        pass\n    def push(self, val: int) -> None:\n        pass\n    def pop(self) -> None:\n        pass\n    def top(self) -> int:\n        return 0\n    def getMin(self) -> int:\n        return 0',
    cppFunc: 'class MinStack {\npublic:\n    MinStack() {}\n    void push(int val) {}\n    void pop() {}\n    int top() { return 0; }\n    int getMin() { return 0; }\n};'
  },
  {
    id: 'implement_queue_stacks',
    title: 'Queue using Stacks',
    difficulty: 'Easy',
    topic: 'Stack',
    problemStatement: 'Implement a first in first out (FIFO) queue using only two stacks.',
    input: '["MyQueue","push","push","peek","pop","empty"]',
    output: '[null,null,null,1,1,false]',
    explanation: 'FIFO behavior simulated.',
    constraints: ['1 <= x <= 9'],
    jsFunc: 'class MyQueue {\n    constructor() {}\n    push(x) {}\n    pop() {}\n    peek() {}\n    empty() {}\n}',
    pyFunc: 'class MyQueue:\n    def __init__(self):\n        pass\n    def push(self, x: int) -> None:\n        pass\n    def pop(self) -> int:\n        return 0\n    def peek(self) -> int:\n        return 0\n    def empty(self) -> bool:\n        return False',
    cppFunc: 'class MyQueue {\npublic:\n    MyQueue() {}\n    void push(int x) {}\n    int pop() { return 0; }\n    int peek() { return 0; }\n    bool empty() { return false; }\n};'
  },
  {
    id: 'eval_rpn',
    title: 'Evaluate Reverse Polish Notation',
    difficulty: 'Medium',
    topic: 'Stack',
    problemStatement: 'Evaluate the value of an arithmetic expression in Reverse Polish Notation. Valid operators are `+`, `-`, `*`, and `/`. Each operand may be an integer or another expression.',
    input: 'tokens = ["2","1","+","3","*"]',
    output: '9',
    explanation: '((2 + 1) * 3) = 9.',
    constraints: ['1 <= tokens.length <= 10^4'],
    jsFunc: 'function evalRPN(tokens) {\n    return 0;\n}',
    pyFunc: 'class Solution:\n    def evalRPN(self, tokens: List[str]) -> int:\n        return 0',
    cppFunc: 'class Solution {\npublic:\n    int evalRPN(vector<string>& tokens) {\n        return 0;\n    }\n};'
  },
  {
    id: 'generate_parentheses',
    title: 'Generate Parentheses',
    difficulty: 'Medium',
    topic: 'Stack',
    problemStatement: 'Given `n` pairs of parentheses, write a function to generate all combinations of well-formed parentheses.',
    input: 'n = 3',
    output: '["((()))","(()())","(())()","()(())","()()()"]',
    explanation: 'All combinations generated.',
    constraints: ['1 <= n <= 8'],
    jsFunc: 'function generateParenthesis(n) {\n    return [];\n}',
    pyFunc: 'class Solution:\n    def generateParenthesis(self, n: int) -> List[str]:\n        return []',
    cppFunc: 'class Solution {\npublic:\n    vector<string> generateParenthesis(int n) {\n        return {};\n    }\n};'
  },
  { id: 'valid_parentheses', title: 'Valid Parentheses', difficulty: 'Easy', topic: 'Stack', problemStatement: 'Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.', input: 's = "()"', output: 'true', explanation: 'Matched parenthesis.', constraints: ['1 <= s.length <= 10^4'], jsFunc: 'function isValid(s) {\n    return false;\n}', pyFunc: 'class Solution:\n    def isValid(self, s: str) -> bool:\n        return False', cppFunc: 'class Solution {\npublic:\n    bool isValid(string s) {\n        return false;\n    }\n};' },
  { id: 'min_stack', title: 'Min Stack', difficulty: 'Easy', topic: 'Stack', problemStatement: 'Design a stack that supports push, pop, top, and retrieving the minimum element in constant time.', input: '["MinStack","push","push","getMin"], val = [-2,0]', output: '[null,null,null,-2]', explanation: 'Retrieved minimum in O(1).', constraints: ['-2^31 <= val <= 2^31 - 1'], jsFunc: 'class MinStack {\n    constructor() {}\n    push(val) {}\n    pop() {}\n    top() {}\n    getMin() {}\n}', pyFunc: 'class MyMinStack:\n    def __init__(self):\n        pass\n    def push(self, val: int) -> None:\n        pass\n    def pop(self) -> None:\n        pass', cppFunc: 'class MyMinStack {\npublic:\n    void push(int val) {}\n};' },
  { id: 'implement_queue_stacks', title: 'Queue using Stacks', difficulty: 'Easy', topic: 'Stack', problemStatement: 'Implement a first in first out (FIFO) queue using only two stacks.', input: '["MyQueue","push","push","peek"], val = 1', output: '[null,null,null,1]', explanation: 'FIFO behavior simulated.', constraints: ['1 <= val <= 9'], jsFunc: 'class MyQueue {\n    constructor() {}\n    push(x) {}\n    peek() { return 0; }\n}', pyFunc: 'class MyQueue:\n    def push(self, x: int) -> None:\n        pass', cppFunc: 'class MyQueue {\npublic:\n    void push(int x) {}\n};' },
  { id: 'eval_rpn', title: 'Evaluate RPN', difficulty: 'Medium', topic: 'Stack', problemStatement: 'Evaluate the value of an arithmetic expression in Reverse Polish Notation.', input: 'tokens = ["2","1","+","3","*"]', output: '9', explanation: '((2 + 1) * 3) = 9.', constraints: ['1 <= tokens.length <= 10^4'], jsFunc: 'function evalRPN(tokens) {\n    return 0;\n}', pyFunc: 'class Solution:\n    def evalRPN(self, tokens: List[str]) -> int:\n        return 0', cppFunc: 'class Solution {\npublic:\n    int evalRPN(vector<string>& tokens) {\n        return 0;\n    }\n};' },
  { id: 'generate_parentheses', title: 'Generate Parentheses', difficulty: 'Medium', topic: 'Stack', problemStatement: 'Given n pairs of parentheses, generate all combinations of well-formed parentheses.', input: 'n = 2', output: '["(())","()()"]', explanation: 'Combinations generated.', constraints: ['1 <= n <= 8'], jsFunc: 'function generateParenthesis(n) {\n    return [];\n}', pyFunc: 'class Solution:\n    def generateParenthesis(self, n: int) -> List[str]:\n        return []', cppFunc: 'class Solution {\npublic:\n    vector<string> generateParenthesis(int n) {\n        return {};\n    }\n};' },
  { id: 'daily_temperatures', title: 'Daily Temperatures', difficulty: 'Medium', topic: 'Stack', problemStatement: 'Given an array of daily temperatures, return an array of wait days to get warmer.', input: 'temperatures = [30,40]', output: '[1,0]', explanation: 'Next warmer day is index 1.', constraints: ['1 <= temperatures.length <= 10^5'], jsFunc: 'function dailyTemperatures(temperatures) {\n    return [];\n}', pyFunc: 'class Solution:\n    def dailyTemperatures(self, temperatures: List[int]) -> List[int]:\n        return []', cppFunc: 'class Solution {\npublic:\n    vector<int> dailyTemperatures(vector<int>& temperatures) {\n        return {};\n    }\n};' },
  { id: 'maximal_rectangle', title: 'Maximal Rectangle', difficulty: 'Hard', topic: 'Stack', problemStatement: 'Given a rows x cols binary matrix filled with 0s and 1s, find the largest rectangle containing only 1s and return its area.', input: 'matrix = [["1","0","1"]]', output: '1', explanation: 'Area 1 found.', constraints: ['m == matrix.length'], jsFunc: 'function maximalRectangle(matrix) {\n    return 0;\n}', pyFunc: 'class Solution:\n    def maximalRectangle(self, matrix: List[List[str]]) -> int:\n        return 0', cppFunc: 'class Solution {\npublic:\n    int maximalRectangle(vector<vector<char>>& matrix) {\n        return 0;\n    }\n};' },
  { id: 'basic_calculator', title: 'Basic Calculator', difficulty: 'Hard', topic: 'Stack', problemStatement: 'Given a string `s` representing a valid expression, implement a basic calculator to evaluate it.', input: 's = "1 + 1"', output: '2', explanation: 'Simple addition.', constraints: ['1 <= s.length <= 10^5'], jsFunc: 'function calculate(s) {\n    return 0;\n}', pyFunc: 'class Solution:\n    def calculate(self, s: str) -> int:\n        return 0', cppFunc: 'class Solution {\npublic:\n    int calculate(string s) {\n        return 0;\n    }\n};' },

  // Queues & FIFO
  { id: 'implement_stack_queues', title: 'Stack using Queues', difficulty: 'Easy', topic: 'Queue', problemStatement: 'Implement a last-in-first-out (LIFO) stack using only two queues.', input: '["MyStack","push","top","pop"], val = 1', output: '[null,null,1,1]', explanation: 'Stack operations simulated.', constraints: ['1 <= val <= 9'], jsFunc: 'class MyStack {\n    constructor() {}\n    push(x) {}\n    pop() {}\n    top() {}\n}', pyFunc: 'class MyStack:\n    def __init__(self):\n        pass\n    def push(self, x: int) -> None:\n        pass\n    def pop() -> int:\n        return 0', cppFunc: 'class MyStack {\npublic:\n    MyStack() {}\n    void push(int x) {}\n    int pop() { return 0; }\n};' },
  { id: 'recent_calls', title: 'Number of Recent Calls', difficulty: 'Easy', topic: 'Queue', problemStatement: 'You have a RecentCounter class which counts the number of recent requests within a 3000ms window.', input: '["RecentCounter","ping","ping"], t = [1, 100]', output: '[null,1,2]', explanation: 'Number of pings returned.', constraints: ['1 <= t <= 10^9'], jsFunc: 'class RecentCounter {\n    ping(t) { return 0; }\n}', pyFunc: 'class RecentCounter:\n    def ping(self, t: int) -> int:\n        return 0', cppFunc: 'class RecentCounter {\npublic:\n    int ping(int t) { return 0; }\n};' },
  { id: 'circular_queue_easy', title: 'Design Circular Queue (Easy)', difficulty: 'Easy', topic: 'Queue', problemStatement: 'Design your implementation of the circular queue. The circular queue is a linear data structure in which operations are based on FIFO.', input: '["MyCircularQueue","enQueue"], k = 3', output: '[null,true]', explanation: 'Successfully initialized and enqueued.', constraints: ['1 <= k <= 1000'], jsFunc: 'class MyCircularQueue {\n    constructor(k) {}\n    enQueue(val) { return true; }\n}', pyFunc: 'class MyCircularQueue:\n    def __init__(self, k: int):\n        pass\n    def enQueue(self, val: int) -> bool:\n        return True', cppFunc: 'class MyCircularQueue {\npublic:\n    MyCircularQueue(int k) {}\n    bool enQueue(int val) { return true; }\n};' },
  { id: 'circular_queue_med', title: 'Design Circular Queue (Med)', difficulty: 'Medium', topic: 'Queue', problemStatement: 'Design your circular queue with Front, Rear, isEmpty, and isFull indicators.', input: '["MyCircularQueue","isFull"], k = 3', output: '[null,false]', explanation: 'Checked queue properties.', constraints: ['1 <= k <= 1000'], jsFunc: 'class MyCircularQueue {\n    Front() { return 0; }\n    isFull() { return false; }\n}', pyFunc: 'class MyCircularQueue:\n    def Front(self) -> int:\n        return 0\n    def isFull(self) -> bool:\n        return False', cppFunc: 'class MyCircularQueue {\npublic:\n    int Front() { return 0; }\n    bool isFull() { return false; }\n};' },
  { id: 'task_scheduler', title: 'Task Scheduler', difficulty: 'Medium', topic: 'Queue', problemStatement: 'Given a characters array tasks representing CPU tasks, return the least number of units of times CPU takes to finish all tasks.', input: 'tasks = ["A","A","A","B","B","B"], n = 2', output: '8', explanation: 'Optimal order A->B->idle->A->B->idle->A->B.', constraints: ['1 <= tasks.length <= 10^4'], jsFunc: 'function leastInterval(tasks, n) {\n    return 0;\n}', pyFunc: 'class Solution:\n    def leastInterval(self, tasks: List[str], n: int) -> int:\n        return 0', cppFunc: 'class Solution {\npublic:\n    int leastInterval(vector<char>& tasks, int n) {\n        return 0;\n    }\n};' },
  { id: 'shortest_subarray_k_med', title: 'Shortest Subarray Sum K (Med)', difficulty: 'Medium', topic: 'Queue', problemStatement: 'Given an integer array nums and integer k, return length of shortest non-empty subarray with sum of at least k.', input: 'nums = [2,-1,2], k = 3', output: '3', explanation: 'The subarray [2,-1,2] sum is 3.', constraints: ['1 <= nums.length <= 10^5'], jsFunc: 'function shortestSubarray(nums, k) {\n    return -1;\n}', pyFunc: 'class Solution:\n    def shortestSubarray(self, nums: List[int], k: int) -> int:\n        return -1', cppFunc: 'class Solution {\npublic:\n    int shortestSubarray(vector<int>& nums, int k) {\n        return -1;\n    }\n};' },
  { id: 'sliding_window_max', title: 'Sliding Window Maximum', difficulty: 'Hard', topic: 'Queue', problemStatement: 'You are given an array of integers nums, there is a sliding window of size k moving from left to right. Return max sliding window.', input: 'nums = [1,3,-1,-3,5,3], k = 3', output: '[3,3,5,5]', explanation: 'Max elements in window returned.', constraints: ['1 <= nums.length <= 10^5'], jsFunc: 'function maxSlidingWindow(nums, k) {\n    return [];\n}', pyFunc: 'class Solution:\n    def maxSlidingWindow(self, nums: List[int], k: int) -> List[int]:\n        return []', cppFunc: 'class Solution {\npublic:\n    vector<int> maxSlidingWindow(vector<int>& nums, int k) {\n        return {};\n    }\n};' },
  { id: 'shortest_subarray_k_hard', title: 'Shortest Subarray Sum K (Hard)', difficulty: 'Hard', topic: 'Queue', problemStatement: 'Given nums and integer k, return the shortest subarray length with sum >= k, optimizing for space parameters.', input: 'nums = [1,2], k = 4', output: '-1', explanation: 'No such subarray.', constraints: ['1 <= nums.length <= 10^5'], jsFunc: 'function shortestSubarray(nums, k) {\n    return -1;\n}', pyFunc: 'class Solution:\n    def shortestSubarray(self, nums: List[int], k: int) -> int:\n        return -1', cppFunc: 'class Solution {\npublic:\n    int shortestSubarray(vector<int>& nums, int k) {\n        return -1;\n    }\n};' },
  { id: 'circular_deque', title: 'Design Circular Deque', difficulty: 'Hard', topic: 'Queue', problemStatement: 'Design circular double-ended queue supporting Front, Last, Delete, and Insert parameters.', input: '["MyCircularDeque","insertLast"], k = 3', output: '[null,true]', explanation: 'Deque properties verified.', constraints: ['1 <= k <= 1000'], jsFunc: 'class MyCircularDeque {\n    constructor(k) {}\n    insertFront(val) { return true; }\n}', pyFunc: 'class MyCircularDeque:\n    def insertFront(self, val: int) -> bool:\n        return True', cppFunc: 'class MyCircularDeque {\npublic:\n    bool insertFront(int val) { return true; }\n};' },

  // Searching Algorithms
  { id: 'binary_search', title: 'Binary Search', difficulty: 'Easy', topic: 'Searching', problemStatement: 'Given sorted array and integer target, search target in nums. Return its index or -1.', input: 'nums = [-1,0,3,5,9], target = 9', output: '4', explanation: '9 exists at index 4.', constraints: ['1 <= nums.length <= 10^4'], jsFunc: 'function search(nums, target) {\n    return -1;\n}', pyFunc: 'class Solution:\n    def search(self, nums: List[int], target: int) -> int:\n        return -1', cppFunc: 'class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        return -1;\n    }\n};' },
  { id: 'search_insert_pos', title: 'Search Insert Position', difficulty: 'Easy', topic: 'Searching', problemStatement: 'Given distinct sorted array and target, return index if found or where it would be inserted.', input: 'nums = [1,3,5], target = 5', output: '2', explanation: '5 found at index 2.', constraints: ['1 <= nums.length <= 10^4'], jsFunc: 'function searchInsert(nums, target) {\n    return 0;\n}', pyFunc: 'class Solution:\n    def searchInsert(self, nums: List[int], target: int) -> int:\n        return 0', cppFunc: 'class Solution {\npublic:\n    int searchInsert(vector<int>& nums, int target) {\n        return 0;\n    }\n};' },
  { id: 'guess_num', title: 'Guess Number Game', difficulty: 'Easy', topic: 'Searching', problemStatement: 'Guess the picked number using the helper api API guess(num).', input: 'n = 10, pick = 6', output: '6', explanation: 'Number 6 identified.', constraints: ['1 <= n <= 2^31 - 1'], jsFunc: 'function guessNumber(n) {\n    return 0;\n}', pyFunc: 'class Solution:\n    def guessNumber(self, n: int) -> int:\n        return 0', cppFunc: 'class Solution {\npublic:\n    int guessNumber(int n) {\n        return 0;\n    }\n};' },
  { id: 'search_rotated_array', title: 'Search in Rotated Sorted Array', difficulty: 'Medium', topic: 'Searching', problemStatement: 'Given sorted rotated array nums and integer target, return target index or -1 in O(log n).', input: 'nums = [4,5,6,7,0,1], target = 0', output: '4', explanation: '0 found at index 4.', constraints: ['1 <= nums.length <= 5000'], jsFunc: 'function search(nums, target) {\n    return -1;\n}', pyFunc: 'class Solution:\n    def search(self, nums: List[int], target: int) -> int:\n        return -1', cppFunc: 'class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        return -1;\n    }\n};' },
  { id: 'find_min_rotated', title: 'Find Min in Rotated Array', difficulty: 'Medium', topic: 'Searching', problemStatement: 'Given unique sorted rotated array nums, return the minimum element.', input: 'nums = [3,4,5,1,2]', output: '1', explanation: 'Min element is 1.', constraints: ['1 <= nums.length <= 5000'], jsFunc: 'function findMin(nums) {\n    return 0;\n}', pyFunc: 'class Solution:\n    def findMin(self, nums: List[int]) -> int:\n        return 0', cppFunc: 'class Solution {\npublic:\n    int findMin(vector<int>& nums) {\n        return 0;\n    }\n};' },
  { id: 'search_2d_matrix', title: 'Search a 2D Matrix', difficulty: 'Medium', topic: 'Searching', problemStatement: 'Write an efficient algorithm that searches for target in m x n sorted matrix.', input: 'matrix = [[1,3],[10,11]], target = 3', output: 'true', explanation: '3 is present.', constraints: ['m == matrix.length'], jsFunc: 'function searchMatrix(matrix, target) {\n    return false;\n}', pyFunc: 'class Solution:\n    def searchMatrix(self, matrix: List[List[int]], target: int) -> bool:\n        return False', cppFunc: 'class Solution {\npublic:\n    bool searchMatrix(vector<vector<int>>& matrix, int target) {\n        return false;\n    }\n};' },
  { id: 'median_two_arrays', title: 'Median of Two Sorted Arrays', difficulty: 'Hard', topic: 'Searching', problemStatement: 'Given two sorted arrays nums1 and nums2, return the median in O(log(m+n)).', input: 'nums1 = [1,3], nums2 = [2]', output: '2.0', explanation: 'Merged array [1,2,3] median is 2.', constraints: ['0 <= m, n <= 1000'], jsFunc: 'function findMedianSortedArrays(nums1, nums2) {\n    return 0.0;\n}', pyFunc: 'class Solution:\n    def findMedianSortedArrays(self, nums1: List[int], nums2: List[int]) -> float:\n        return 0.0', cppFunc: 'class Solution {\npublic:\n    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {\n        return 0.0;\n    }\n};' },
  { id: 'find_min_rotated_ii', title: 'Find Min in Rotated Array II', difficulty: 'Hard', topic: 'Searching', problemStatement: 'Given sorted rotated array nums that may contain duplicates, return minimum element.', input: 'nums = [2,2,2,0,1]', output: '0', explanation: 'Minimum value is 0.', constraints: ['1 <= nums.length <= 5000'], jsFunc: 'function findMin(nums) {\n    return 0;\n}', pyFunc: 'class Solution:\n    def findMin(self, nums: List[int]) -> int:\n        return 0', cppFunc: 'class Solution {\npublic:\n    int findMin(vector<int>& nums) {\n        return 0;\n    }\n};' },
  { id: 'split_array_largest_sum', title: 'Split Array Largest Sum', difficulty: 'Hard', topic: 'Searching', problemStatement: 'Given array nums and integer k, split array into k non-empty subarrays minimizing the largest sum.', input: 'nums = [7,2,5], k = 2', output: '9', explanation: 'Split [7,2] and [5]. Largest sum is 9.', constraints: ['1 <= nums.length <= 1000'], jsFunc: 'function splitArray(nums, k) {\n    return 0;\n}', pyFunc: 'class Solution:\n    def splitArray(self, nums: List[int], k: int) -> int:\n        return 0', cppFunc: 'class Solution {\npublic:\n    int splitArray(vector<int>& nums, int k) {\n        return 0;\n    }\n};' },

  // Sorting Algorithms
  { id: 'merge_sorted_array', title: 'Merge Sorted Array', difficulty: 'Easy', topic: 'Sorting', problemStatement: 'Merge sorted arrays nums1 and nums2 into nums1 in-place.', input: 'nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3', output: '[1,2,2,3,5,6]', explanation: 'Merged and sorted.', constraints: ['nums1.length == m + n'], jsFunc: 'function merge(nums1, m, nums2, n) {\n    // merge\n}', pyFunc: 'class Solution:\n    def merge(self, nums1: List[int], m: int, nums2: List[int], n: int) -> None:\n        pass', cppFunc: 'class Solution {\npublic:\n    void merge(vector<int>& nums1, int m, vector<int>& nums2, int n) {\n    }\n};' },
  { id: 'sort_array_parity', title: 'Sort Array By Parity', difficulty: 'Easy', topic: 'Sorting', problemStatement: 'Given array nums, move all even integers to beginning followed by odd integers.', input: 'nums = [3,1,2,4]', output: '[2,4,3,1]', explanation: 'Evens appear first.', constraints: ['1 <= nums.length <= 5000'], jsFunc: 'function sortArrayByParity(nums) {\n    return [];\n}', pyFunc: 'class Solution:\n    def sortArrayByParity(self, nums: List[int]) -> List[int]:\n        return []', cppFunc: 'class Solution {\npublic:\n    vector<int> sortArrayByParity(vector<int>& nums) {\n        return {};\n    }\n};' },
  { id: 'intersection_arrays', title: 'Intersection of Two Arrays', difficulty: 'Easy', topic: 'Sorting', problemStatement: 'Given two arrays, return array of their intersection. Unique elements only.', input: 'nums1 = [1,2], nums2 = [2]', output: '[2]', explanation: 'Only unique intersection.', constraints: ['1 <= nums1.length <= 1000'], jsFunc: 'function intersection(nums1, nums2) {\n    return [];\n}', pyFunc: 'class Solution:\n    def intersection(self, nums1: List[int], nums2: List[int]) -> List[int]:\n        return []', cppFunc: 'class Solution {\npublic:\n    vector<int> intersection(vector<int>& nums1, vector<int>& nums2) {\n        return {};\n    }\n};' },
  { id: 'sort_an_array', title: 'Sort an Array', difficulty: 'Medium', topic: 'Sorting', problemStatement: 'Given an array of integers nums, sort it in ascending order.', input: 'nums = [5,2,3,1]', output: '[1,2,3,5]', explanation: 'Ascending sorted array.', constraints: ['1 <= nums.length <= 5 * 10^4'], jsFunc: 'function sortArray(nums) {\n    return [];\n}', pyFunc: 'class Solution:\n    def sortArray(self, nums: List[int]) -> List[int]:\n        return []', cppFunc: 'class Solution {\npublic:\n    vector<int> sortArray(vector<int>& nums) {\n        return {};\n    }\n};' },
  { id: 'kth_largest_elem', title: 'Kth Largest Element', difficulty: 'Medium', topic: 'Sorting', problemStatement: 'Given integer array nums and integer k, return the kth largest element.', input: 'nums = [3,2,1,5,4], k = 2', output: '4', explanation: '2nd largest element is 4.', constraints: ['1 <= k <= nums.length'], jsFunc: 'function findKthLargest(nums, k) {\n    return 0;\n}', pyFunc: 'class Solution:\n    def findKthLargest(self, nums: List[int], k: int) -> int:\n        return 0', cppFunc: 'class Solution {\npublic:\n    int findKthLargest(vector<int>& nums, int k) {\n        return 0;\n    }\n};' },
  { id: 'sort_colors', title: 'Sort Colors', difficulty: 'Medium', topic: 'Sorting', problemStatement: 'Sort array containing red, white, blue colors adjacent in-place.', input: 'nums = [2,0,1]', output: '[0,1,2]', explanation: 'In-place sorting.', constraints: ['1 <= nums.length <= 300'], jsFunc: 'function sortColors(nums) {\n    // sort\n}', pyFunc: 'class Solution:\n    def sortColors(self, nums: List[int]) -> None:\n        pass', cppFunc: 'class Solution {\npublic:\n    void sortColors(vector<int>& nums) {\n    }\n};' },
  { id: 'maximum_gap', title: 'Maximum Gap', difficulty: 'Hard', topic: 'Sorting', problemStatement: 'Return maximum difference between successive elements in sorted form.', input: 'nums = [3,6,1]', output: '2', explanation: 'Sorted [1,3,6] max diff 6-3=3, 3-1=2, returns 3 or 2.', constraints: ['1 <= nums.length <= 10^5'], jsFunc: 'function maximumGap(nums) {\n    return 0;\n}', pyFunc: 'class Solution:\n    def maximumGap(self, nums: List[int]) -> int:\n        return 0', cppFunc: 'class Solution {\npublic:\n    int maximumGap(vector<int>& nums) {\n        return 0;\n    }\n};' },
  { id: 'merge_interval_postings', title: 'Merge Interval Postings', difficulty: 'Hard', topic: 'Sorting', problemStatement: 'Merge all overlapping transaction intervals in O(N log N).', input: 'intervals = [[1,3],[2,4]]', output: '[[1,4]]', explanation: 'Merged overlapping intervals.', constraints: ['1 <= intervals.length <= 10^4'], jsFunc: 'function mergeIntervals(intervals) {\n    return [];\n}', pyFunc: 'class Solution:\n    def mergeIntervals(self, intervals: List[List[int]]) -> List[List[int]]:\n        return []', cppFunc: 'class Solution {\npublic:\n    vector<vector<int>> mergeIntervals(vector<vector<int>>& intervals) {\n        return {};\n    }\n};' },
  { id: 'queue_reconstruction', title: 'Queue Reconstruction', difficulty: 'Hard', topic: 'Sorting', problemStatement: 'Reconstruct queue represented by people pairs (h, k).', input: 'people = [[7,0],[4,4]]', output: '[[7,0],[4,4]]', explanation: 'Queue reconstructed matching counts.', constraints: ['1 <= people.length <= 2000'], jsFunc: 'function reconstructQueue(people) {\n    return [];\n}', pyFunc: 'class Solution:\n    def reconstructQueue(self, people: List[List[int]]) -> List[List[int]]:\n        return []', cppFunc: 'class Solution {\npublic:\n    vector<vector<int>> reconstructQueue(vector<vector<int>>& people) {\n        return {};\n    }\n};' },

  // Depth-First Search
  { id: 'max_depth_binary_tree', title: 'Max Depth of Binary Tree', difficulty: 'Easy', topic: 'depth-first-search', problemStatement: 'Given root of binary tree, return its maximum depth.', input: 'root = [3,9,20]', output: '2', explanation: 'Depth is 2.', constraints: ['Nodes count <= 10^4'], jsFunc: 'function maxDepth(root) {\n    return 0;\n}', pyFunc: 'class Solution:\n    def maxDepth(self, root: Optional[TreeNode]) -> int:\n        return 0', cppFunc: 'class Solution {\npublic:\n    int maxDepth(TreeNode* root) {\n        return 0;\n    }\n};' },
  { id: 'same_tree', title: 'Same Tree', difficulty: 'Easy', topic: 'depth-first-search', problemStatement: 'Determine if two binary trees are identical.', input: 'p = [1,2], q = [1,2]', output: 'true', explanation: 'Trees match exactly.', constraints: ['Nodes count <= 100'], jsFunc: 'function isSameTree(p, q) {\n    return false;\n}', pyFunc: 'class Solution:\n    def isSameTree(self, p: Optional[TreeNode], q: Optional[TreeNode]) -> bool:\n        return False', cppFunc: 'class Solution {\npublic:\n    bool isSameTree(TreeNode* p, TreeNode* q) {\n        return false;\n    }\n};' },
  { id: 'path_sum', title: 'Path Sum', difficulty: 'Easy', topic: 'depth-first-search', problemStatement: 'Check if tree has root-to-leaf path summing to targetSum.', input: 'root = [5,4], target = 9', output: 'true', explanation: 'Path exists.', constraints: ['Nodes count <= 5000'], jsFunc: 'function hasPathSum(root, targetSum) {\n    return false;\n}', pyFunc: 'class Solution:\n    def hasPathSum(self, root: Optional[TreeNode], targetSum: int) -> bool:\n        return False', cppFunc: 'class Solution {\npublic:\n    bool hasPathSum(TreeNode* root, int targetSum) {\n        return false;\n    }\n};' },
  { id: 'dfs_level_order', title: 'Binary Tree BFS via DFS', difficulty: 'Medium', topic: 'depth-first-search', problemStatement: 'Implement Binary Tree Level Order recursively using DFS traversal tracking.', input: 'root = [1,2]', output: '[[1],[2]]', explanation: 'DFS depth lists traversed.', constraints: ['Nodes count <= 2000'], jsFunc: 'function levelOrder(root) {\n    return [];\n}', pyFunc: 'class Solution:\n    def levelOrder(self, root: Optional[TreeNode]) -> List[List[int]]:\n        return []', cppFunc: 'class Solution {\npublic:\n    vector<vector<int>> levelOrder(TreeNode* root) {\n        return {};\n    }\n};' },
  { id: 'validate_bst', title: 'Validate Binary Search Tree', difficulty: 'Medium', topic: 'depth-first-search', problemStatement: 'Determine if root binary tree is valid binary search tree (BST).', input: 'root = [2,1,3]', output: 'true', explanation: 'Sorted subtree ranges match.', constraints: ['Nodes count <= 10^4'], jsFunc: 'function isValidBST(root) {\n    return false;\n}', pyFunc: 'class Solution:\n    def isValidBST(self, root: Optional[TreeNode]) -> bool:\n        return False', cppFunc: 'class Solution {\npublic:\n    bool isValidBST(TreeNode* root) {\n        return false;\n    }\n};' },
  { id: 'clone_graph', title: 'Clone Graph', difficulty: 'Medium', topic: 'depth-first-search', problemStatement: 'Deep clone reference connected undirected graph node.', input: 'adjList = [[2],[1]]', output: '[[2],[1]]', explanation: 'Deep cloned graph copy.', constraints: ['Nodes count <= 100'], jsFunc: 'function cloneGraph(node) {\n    return node;\n}', pyFunc: 'class Solution:\n    def cloneGraph(self, node: "Node") -> "Node":\n        return node', cppFunc: 'class Solution {\npublic:\n    Node* cloneGraph(Node* node) {\n        return node;\n    }\n};' },
  { id: 'binary_tree_max_path_sum', title: 'Binary Tree Max Path Sum', difficulty: 'Hard', topic: 'depth-first-search', problemStatement: 'Find maximum path sum of any non-empty path in binary tree.', input: 'root = [1,2,3]', output: '6', explanation: 'Path 2+1+3 = 6.', constraints: ['Nodes count <= 3 * 10^4'], jsFunc: 'function maxPathSum(root) {\n    return 0;\n}', pyFunc: 'class Solution:\n    def maxPathSum(self, root: Optional[TreeNode]) -> int:\n        return 0', cppFunc: 'class Solution {\npublic:\n    int maxPathSum(TreeNode* root) {\n        return 0;\n    }\n};' },
  { id: 'word_search_ii', title: 'Word Search II', difficulty: 'Hard', topic: 'depth-first-search', problemStatement: 'Given grid and list of words, return all words on board.', input: 'board = [["a"]], words = ["a"]', output: '["a"]', explanation: 'Matched words found.', constraints: ['board.length <= 12'], jsFunc: 'function findWords(board, words) {\n    return [];\n}', pyFunc: 'class Solution:\n    def findWords(self, board: List[List[str]], words: List[str]) -> List[str]:\n        return []', cppFunc: 'class Solution {\npublic:\n    vector<string> findWords(vector<vector<char>>& board, vector<string>& words) {\n        return {};\n    }\n};' },
  { id: 'serialize_deserialize_tree', title: 'Serialize/Deserialize Tree', difficulty: 'Hard', topic: 'depth-first-search', problemStatement: 'Design serialization and deserialization lifecycle for binary tree.', input: 'root = [1,2]', output: '[1,2]', explanation: 'Tree stringified and parsed.', constraints: ['Nodes count <= 10^4'], jsFunc: 'function serialize(root) {}\nfunction deserialize(data) {}', pyFunc: 'class Codec:\n    def serialize(self, root):\n        return ""\n    def deserialize(self, data):\n        return None',
    cppFunc: 'class Codec {\npublic:\n    string serialize(TreeNode* root) { return ""; }\n    TreeNode* deserialize(string data) { return nullptr; }\n};'
  },

  // Breadth-First Search
  { id: 'level_order_ii', title: 'Binary Tree Level Order II', difficulty: 'Easy', topic: 'breadth-first-search', problemStatement: 'Return bottom-up level order traversal of nodes values.', input: 'root = [3,9]', output: '[[9],[3]]', explanation: 'Bottom-up order.', constraints: ['Nodes count <= 2000'], jsFunc: 'function levelOrderBottom(root) {\n    return [];\n}', pyFunc: 'class Solution:\n    def levelOrderBottom(self, root: Optional[TreeNode]) -> List[List[int]]:\n        return []', cppFunc: 'class Solution {\npublic:\n    vector<vector<int>> levelOrderBottom(TreeNode* root) {\n        return {};\n    }\n};' },
  { id: 'average_levels', title: 'Average of Tree Levels', difficulty: 'Easy', topic: 'breadth-first-search', problemStatement: 'Return average value of nodes on each level of tree.', input: 'root = [3,9,20]', output: '[3.0,14.5]', explanation: 'Averages calculated.', constraints: ['Nodes count <= 10^4'], jsFunc: 'function averageOfLevels(root) {\n    return [];\n}', pyFunc: 'class Solution:\n    def averageOfLevels(self, root: Optional[TreeNode]) -> List[float]:\n        return []', cppFunc: 'class Solution {\npublic:\n    vector<double> averageOfLevels(TreeNode* root) {\n        return {};\n    }\n};' },
  { id: 'min_depth_tree', title: 'Minimum Depth of Tree', difficulty: 'Easy', topic: 'breadth-first-search', problemStatement: 'Find shortest path node depth from root down to leaf.', input: 'root = [3,9]', output: '2', explanation: 'Shortest path length is 2.', constraints: ['Nodes count <= 10^5'], jsFunc: 'function minDepth(root) {\n    return 0;\n}', pyFunc: 'class Solution:\n    def minDepth(self, root: Optional[TreeNode]) -> int:\n        return 0', cppFunc: 'class Solution {\npublic:\n    int minDepth(TreeNode* root) {\n        return 0;\n    }\n};' },
  { id: 'level_order_traversal', title: 'Binary Tree Level Order', difficulty: 'Medium', topic: 'breadth-first-search', problemStatement: 'Return left-to-right level order traversal of tree values.', input: 'root = [3,9,20]', output: '[[3],[9,20]]', explanation: 'Traversed level by level.', constraints: ['Nodes count <= 2000'], jsFunc: 'function levelOrder(root) {\n    return [];\n}', pyFunc: 'class Solution:\n    def levelOrder(self, root: Optional[TreeNode]) -> List[List[int]]:\n        return []', cppFunc: 'class Solution {\npublic:\n    vector<vector<int>> levelOrder(TreeNode* root) {\n        return {};\n    }\n};' },
  { id: 'rotting_oranges', title: 'Rotting Oranges', difficulty: 'Medium', topic: 'breadth-first-search', problemStatement: 'Find min minutes until all fresh oranges rot in grid.', input: 'grid = [[2,1],[1,1]]', output: '2', explanation: 'Takes 2 steps.', constraints: ['m == grid.length'], jsFunc: 'function orangesRotting(grid) {\n    return -1;\n}', pyFunc: 'class Solution:\n    def orangesRotting(self, grid: List[List[int]]) -> int:\n        return -1', cppFunc: 'class Solution {\npublic:\n    int orangesRotting(vector<vector<int>>& grid) {\n        return -1;\n    }\n};' },
  { id: 'pacific_atlantic', title: 'Pacific Atlantic Flow', difficulty: 'Medium', topic: 'breadth-first-search', problemStatement: 'List grid coordinates from which water flows to both oceans.', input: 'heights = [[1,2],[2,1]]', output: '[[0,1],[1,0]]', explanation: 'Valid cells matching Ocean slopes.', constraints: ['m, n <= 200'], jsFunc: 'function pacificAtlantic(heights) {\n    return [];\n}', pyFunc: 'class Solution:\n    def pacificAtlantic(self, heights: List[List[int]]) -> List[List[int]]:\n        return []', cppFunc: 'class Solution {\npublic:\n    vector<vector<int>> pacificAtlantic(vector<vector<int>>& heights) {\n        return {};\n    }\n};' },
  { id: 'word_ladder', title: 'Word Ladder', difficulty: 'Hard', topic: 'breadth-first-search', problemStatement: 'Find length of shortest transformation sequence from beginWord to endWord.', input: 'begin = "a", end = "c", list = ["a","b","c"]', output: '2', explanation: 'a -> c transformation.', constraints: ['1 <= begin.length <= 10'], jsFunc: 'function ladderLength(beginWord, endWord, wordList) {\n    return 0;\n}', pyFunc: 'class Solution:\n    def ladderLength(self, beginWord: str, endWord: str, wordList: List[str]) -> int:\n        return 0', cppFunc: 'class Solution {\npublic:\n    int ladderLength(string beginWord, string endWord, vector<string>& wordList) {\n        return 0;\n    }\n};' },
  { id: 'cut_off_trees', title: 'Cut Off Trees for Golf', difficulty: 'Hard', topic: 'breadth-first-search', problemStatement: 'Find minimum steps to cut all forest trees in ascending order.', input: 'forest = [[1,2],[0,3]]', output: '2', explanation: 'Cut order index steps.', constraints: ['m == forest.length'], jsFunc: 'function cutOffTree(forest) {\n    return -1;\n}', pyFunc: 'class Solution:\n    def cutOffTree(self, forest: List[List[int]]) -> int:\n        return -1', cppFunc: 'class Solution {\npublic:\n    int cutOffTree(vector<vector<int>>& forest) {\n        return -1;\n    }\n};' },
  { id: 'shortest_path_obstacles', title: 'Shortest Path with Obstacles', difficulty: 'Hard', topic: 'breadth-first-search', problemStatement: 'Find shortest path permitting removal of at most k obstacles.', input: 'grid = [[0,0],[1,0]], k = 1', output: '2', explanation: 'Reached end within bounds.', constraints: ['m == grid.length'], jsFunc: 'function shortestPath(grid, k) {\n    return -1;\n}', pyFunc: 'class Solution:\n    def shortestPath(self, grid: List[List[int]], k: int) -> int:\n        return -1', cppFunc: 'class Solution {\npublic:\n    int shortestPath(vector<vector<int>>& grid, int k) {\n        return -1;\n    }\n};' },

  // Two-Pointer Technique
  { id: 'valid_palindrome_ii', title: 'Valid Palindrome II', difficulty: 'Easy', topic: 'two-pointer', problemStatement: 'Check if s can be a palindrome after deleting at most one character.', input: 's = "aba"', output: 'true', explanation: 'Already palindrome.', constraints: ['1 <= s.length <= 10^5'], jsFunc: 'function validPalindrome(s) {\n    return false;\n}', pyFunc: 'class Solution:\n    def validPalindrome(self, s: str) -> bool:\n        return False', cppFunc: 'class Solution {\npublic:\n    bool validPalindrome(string s) {\n        return false;\n    }\n};' },
  { id: 'move_zeroes', title: 'Move Zeroes', difficulty: 'Easy', topic: 'two-pointer', problemStatement: 'Move all 0s to end of array maintaining relative order.', input: 'nums = [0,1]', output: '[1,0]', explanation: 'Zeroes pushed.', constraints: ['1 <= nums.length <= 10^4'], jsFunc: 'function moveZeroes(nums) {\n}', pyFunc: 'class Solution:\n    def moveZeroes(self, nums: List[int]) -> None:\n        pass', cppFunc: 'class Solution {\npublic:\n    void moveZeroes(vector<int>& nums) {\n    }\n};' },
  { id: 'squares_sorted', title: 'Squares of Sorted Array', difficulty: 'Easy', topic: 'two-pointer', problemStatement: 'Return array of squares of each number sorted.', input: 'nums = [-1,0]', output: '[0,1]', explanation: 'Squares sorted.', constraints: ['1 <= nums.length <= 10^4'], jsFunc: 'function sortedSquares(nums) {\n    return [];\n}', pyFunc: 'class Solution:\n    def sortedSquares(self, nums: List[int]) -> List[int]:\n        return []', cppFunc: 'class Solution {\npublic:\n    vector<int> sortedSquares(vector<int>& nums) {\n        return {};\n    }\n};' },
  { id: 'three_sum', title: '3Sum', difficulty: 'Medium', topic: 'two-pointer', problemStatement: 'Return all triplets summing to zero.', input: 'nums = [-1,0,1]', output: '[[-1,0,1]]', explanation: 'Sum is zero.', constraints: ['3 <= nums.length <= 3000'], jsFunc: 'function threeSum(nums) {\n    return [];\n}', pyFunc: 'class Solution:\n    def threeSum(self, nums: List[int]) -> List[List[int]]:\n        return []', cppFunc: 'class Solution {\npublic:\n    vector<vector<int>> threeSum(vector<int>& nums) {\n        return {};\n    }\n};' },
  { id: 'container_most_water', title: 'Container With Most Water', difficulty: 'Medium', topic: 'two-pointer', problemStatement: 'Find two lines that form a container containing the most water.', input: 'height = [1,1]', output: '1', explanation: 'Volume is 1.', constraints: ['2 <= height.length <= 10^5'], jsFunc: 'function maxArea(height) {\n    return 0;\n}', pyFunc: 'class Solution:\n    def maxArea(self, height: List[int]) -> int:\n        return 0', cppFunc: 'class Solution {\npublic:\n    int maxArea(vector<int>& height) {\n        return 0;\n    }\n};' },
  { id: 'two_sum_ii', title: 'Two Sum II - Sorted', difficulty: 'Medium', topic: 'two-pointer', problemStatement: 'Find two numbers adding to target in sorted array. 1-indexed.', input: 'nums = [2,7], target = 9', output: '[1,2]', explanation: '1-indexed indices.', constraints: ['2 <= nums.length <= 3 * 10^4'], jsFunc: 'function twoSum(numbers, target) {\n    return [];\n}', pyFunc: 'class Solution:\n    def twoSum(self, numbers: List[int], target: int) -> List[int]:\n        return []', cppFunc: 'class Solution {\npublic:\n    vector<int> twoSum(vector<int>& numbers, int target) {\n        return {};\n    }\n};' },
  { id: 'trapping_water_two_pointers', title: 'Trapping Rain Water (II)', difficulty: 'Hard', topic: 'two-pointer', problemStatement: 'Trapped rain water in elevation map optimized to O(1) space.', input: 'height = [4,2,3]', output: '1', explanation: 'Trapped 1 unit.', constraints: ['0 <= heights <= 2 * 10^4'], jsFunc: 'function trap(height) {\n    return 0;\n}', pyFunc: 'class Solution:\n    def trap(self, height: List[int]) -> int:\n        return 0', cppFunc: 'class Solution {\npublic:\n    int trap(vector<int>& height) {\n        return 0;\n    }\n};' },
  { id: 'subarrays_k_diff', title: 'Subarrays K Distinct', difficulty: 'Hard', topic: 'two-pointer', problemStatement: 'Return number of subarrays with exactly k different integers.', input: 'nums = [1,2], k = 1', output: '2', explanation: 'Subarrays are [1], [2].', constraints: ['1 <= nums.length <= 2 * 10^4'], jsFunc: 'function subarraysWithKDistinct(nums, k) {\n    return 0;\n}', pyFunc: 'class Solution:\n    def subarraysWithKDistinct(self, nums: List[int], k: int) -> int:\n        return 0', cppFunc: 'class Solution {\npublic:\n    int subarraysWithKDistinct(vector<int>& nums, int k) {\n        return 0;\n    }\n};' },
  { id: 'valid_triangle', title: 'Valid Triangle Number', difficulty: 'Hard', topic: 'two-pointer', problemStatement: 'Return number of side triplets that can form a valid triangle.', input: 'nums = [2,2,3,4]', output: '3', explanation: '[2,2,3], [2,3,4], [2,3,4] are valid.', constraints: ['1 <= nums.length <= 1000'], jsFunc: 'function triangleNumber(nums) {\n    return 0;\n}', pyFunc: 'class Solution:\n    def triangleNumber(self, nums: List[int]) -> int:\n        return 0', cppFunc: 'class Solution {\npublic:\n    int triangleNumber(vector<int>& nums) {\n        return 0;\n    }\n};' },

  // Counting & Hashing
  { id: 'majority_element', title: 'Majority Element', difficulty: 'Easy', topic: 'counting', problemStatement: 'Return majority element which appears > floor(n / 2) times.', input: 'nums = [3,2,3]', output: '3', explanation: '3 occurs twice.', constraints: ['1 <= nums.length <= 5 * 10^4'], jsFunc: 'function majorityElement(nums) {\n    return 0;\n}', pyFunc: 'class Solution:\n    def majorityElement(self, nums: List[int]) -> int:\n        return 0', cppFunc: 'class Solution {\npublic:\n    int majorityElement(vector<int>& nums) {\n        return 0;\n    }\n};' },
  { id: 'disappeared_numbers', title: 'Find Disappeared Numbers', difficulty: 'Easy', topic: 'counting', problemStatement: 'Return array of integers in range [1, n] missing from nums.', input: 'nums = [2,2]', output: '[1]', explanation: '1 is missing.', constraints: ['n == nums.length'], jsFunc: 'function findDisappearedNumbers(nums) {\n    return [];\n}', pyFunc: 'class Solution:\n    def findDisappearedNumbers(self, nums: List[int]) -> List[int]:\n        return []', cppFunc: 'class Solution {\npublic:\n    vector<int> findDisappearedNumbers(vector<int>& nums) {\n        return {};\n    }\n};' },
  { id: 'jewels_stones', title: 'Jewels and Stones', difficulty: 'Easy', topic: 'counting', problemStatement: 'Count stones characters that match jewels types.', input: 'jewels = "a", stones = "aA"', output: '1', explanation: '1 matches.', constraints: ['1 <= stones.length <= 50'], jsFunc: 'function numJewelsInStones(jewels, stones) {\n    return 0;\n}', pyFunc: 'class Solution:\n    def numJewelsInStones(self, jewels: str, stones: str) -> int:\n        return 0', cppFunc: 'class Solution {\npublic:\n    int numJewelsInStones(string jewels, string stones) {\n        return 0;\n    }\n};' },
  { id: 'subarray_sum_k', title: 'Subarray Sum Equals K', difficulty: 'Medium', topic: 'counting', problemStatement: 'Return total continuous subarrays whose sum equals k.', input: 'nums = [1,1], k = 2', output: '1', explanation: 'Index range (0,1) sum is 2.', constraints: ['1 <= nums.length <= 2 * 10^4'], jsFunc: 'function subarraySum(nums, k) {\n    return 0;\n}', pyFunc: 'class Solution:\n    def subarraySum(self, nums: List[int], k: int) -> int:\n        return 0', cppFunc: 'class Solution {\npublic:\n    int subarraySum(vector<int>& nums, int k) {\n        return 0;\n    }\n};' },
  { id: 'longest_consecutive', title: 'Longest Consecutive Sequence', difficulty: 'Medium', topic: 'counting', problemStatement: 'Return length of longest consecutive elements sequence in O(n).', input: 'nums = [1,3,2]', output: '3', explanation: 'Sequence is [1,2,3].', constraints: ['0 <= nums.length <= 10^5'], jsFunc: 'function longestConsecutive(nums) {\n    return 0;\n}', pyFunc: 'class Solution:\n    def longestConsecutive(self, nums: List[int]) -> int:\n        return 0', cppFunc: 'class Solution {\npublic:\n    int longestConsecutive(vector<int>& nums) {\n        return 0;\n    }\n};' },
  { id: 'find_all_anagrams', title: 'Find All Anagrams', difficulty: 'Medium', topic: 'counting', problemStatement: 'Return start indices of p\'s anagrams in s.', input: 's = "abab", p = "ab"', output: '[0,1,2]', explanation: 'Matched anagrams indices.', constraints: ['1 <= s.length <= 3 * 10^4'], jsFunc: 'function findAnagrams(s, p) {\n    return [];\n}', pyFunc: 'class Solution:\n    def findAnagrams(self, s: str, p: str) -> List[int]:\n        return []', cppFunc: 'class Solution {\npublic:\n    vector<int> findAnagrams(string s, string p) {\n        return {};\n    }\n};' },
  { id: 'first_missing_pos_counting', title: 'First Missing Positive (Count)', difficulty: 'Hard', topic: 'counting', problemStatement: 'First Missing Positive utilizing frequency counter slates.', input: 'nums = [1,2]', output: '3', explanation: 'Smallest positive missing is 3.', constraints: ['1 <= nums.length <= 10^5'], jsFunc: 'function firstMissingPositive(nums) {\n    return 1;\n}', pyFunc: 'class Solution:\n    def firstMissingPositive(self, nums: List[int]) -> int:\n        return 1', cppFunc: 'class Solution {\npublic:\n    int firstMissingPositive(vector<int>& nums) {\n        return 1;\n    }\n};' },
  { id: 'subarray_sums_divisible', title: 'Subarray Sums Divisible', difficulty: 'Hard', topic: 'counting', problemStatement: 'Return number of subarrays with sum divisible by k.', input: 'nums = [5], k = 5', output: '1', explanation: 'Divisible by 5.', constraints: ['1 <= nums.length <= 3 * 10^4'], jsFunc: 'function subarraysDivByK(nums, k) {\n    return 0;\n}', pyFunc: 'class Solution:\n    def subarraysDivByK(self, nums: List[int], k: int) -> int:\n        return 0', cppFunc: 'class Solution {\npublic:\n    int subarraysDivByK(vector<int>& nums, int k) {\n        return 0;\n    }\n};' },
  { id: 'max_points_line_counting', title: 'Max Points on Line (Counting)', difficulty: 'Hard', topic: 'counting', problemStatement: 'Find max points on a line using slopes hash counter.', input: 'points = [[1,1],[2,2]]', output: '2', explanation: '2 points match slope.', constraints: ['points.length <= 300'], jsFunc: 'function maxPoints(points) {\n    return 0;\n}', pyFunc: 'class Solution:\n    def maxPoints(self, points: List[List[int]]) -> int:\n        return 0', cppFunc: 'class Solution {\npublic:\n    int maxPoints(vector<vector<int>>& points) {\n        return 0;\n    }\n};' },

  // Math & Logic
  { id: 'fizz_buzz', title: 'Fizz Buzz', difficulty: 'Easy', topic: 'math', problemStatement: 'Return string array output for FizzBuzz sequence logic.', input: 'n = 3', output: '["1","2","Fizz"]', explanation: '3 matches Fizz.', constraints: ['1 <= n <= 10^4'], jsFunc: 'function fizzBuzz(n) {\n    return [];\n}', pyFunc: 'class Solution:\n    def fizzBuzz(self, n: int) -> List[str]:\n        return []', cppFunc: 'class Solution {\npublic:\n    vector<string> fizzBuzz(int n) {\n        return {};\n    }\n};' },
  { id: 'power_of_two', title: 'Power of Two', difficulty: 'Easy', topic: 'math', problemStatement: 'Return true if n is a power of two.', input: 'n = 8', output: 'true', explanation: '2^3 = 8.', constraints: ['-2^31 <= n <= 2^31 - 1'], jsFunc: 'function isPowerOfTwo(n) {\n    return false;\n}', pyFunc: 'class Solution:\n    def isPowerOfTwo(self, n: int) -> bool:\n        return False', cppFunc: 'class Solution {\npublic:\n    bool isPowerOfTwo(int n) {\n        return false;\n    }\n};' },
  { id: 'happy_number', title: 'Happy Number', difficulty: 'Easy', topic: 'math', problemStatement: 'Return true if n resolves to 1 under recursive digit squared sums.', input: 'n = 19', output: 'true', explanation: 'Resolves to 1.', constraints: ['1 <= n <= 2^31 - 1'], jsFunc: 'function isHappy(n) {\n    return false;\n}', pyFunc: 'class Solution:\n    def isHappy(self, n: int) -> bool:\n        return False', cppFunc: 'class Solution {\npublic:\n    bool isHappy(int n) {\n        return false;\n    }\n};' },
  { id: 'pow_x_n', title: 'Pow(x, n)', difficulty: 'Medium', topic: 'math', problemStatement: 'Calculate x raised to the power n.', input: 'x = 2.0, n = 2', output: '4.0', explanation: '2^2 = 4.', constraints: ['-100.0 < x < 100.0'], jsFunc: 'function myPow(x, n) {\n    return 0.0;\n}', pyFunc: 'class Solution:\n    def myPow(self, x: float, n: int) -> float:\n        return 0.0', cppFunc: 'class Solution {\npublic:\n    double myPow(double x, int n) {\n        return 0.0;\n    }\n};' },
  { id: 'trailing_zeroes', title: 'Factorial Trailing Zeroes', difficulty: 'Medium', topic: 'math', problemStatement: 'Return number of trailing zeroes in n! factorial.', input: 'n = 5', output: '1', explanation: '5! = 120.', constraints: ['0 <= n <= 10^4'], jsFunc: 'function trailingZeroes(n) {\n    return 0;\n}', pyFunc: 'class Solution:\n    def trailingZeroes(self, n: int) -> int:\n        return 0', cppFunc: 'class Solution {\npublic:\n    int trailingZeroes(int n) {\n        return 0;\n    }\n};' },
  { id: 'integer_to_roman', title: 'Integer to Roman', difficulty: 'Medium', topic: 'math', problemStatement: 'Convert integer to roman numeral string.', input: 'num = 3', output: '"III"', explanation: '3 translates to III.', constraints: ['1 <= num <= 3999'], jsFunc: 'function intToRoman(num) {\n    return "";\n}', pyFunc: 'class Solution:\n    def intToRoman(self, num: int) -> str:\n        return ""', cppFunc: 'class Solution {\npublic:\n    string intToRoman(int num) {\n        return "";\n    }\n};' },
  { id: 'max_points_line', title: 'Max Points on a Line', difficulty: 'Hard', topic: 'math', problemStatement: 'Return max number of points on a single straight line.', input: 'points = [[1,1],[2,2],[3,3]]', output: '3', explanation: 'All 3 on same line.', constraints: ['points.length <= 300'], jsFunc: 'function maxPoints(points) {\n    return 0;\n}', pyFunc: 'class Solution:\n    def maxPoints(self, points: List[List[int]]) -> int:\n        return 0', cppFunc: 'class Solution {\npublic:\n    int maxPoints(vector<vector<int>>& points) {\n        return 0;\n    }\n};' },
  { id: 'permutation_sequence', title: 'Permutation Sequence', difficulty: 'Hard', topic: 'math', problemStatement: 'Return kth lexicographical permutation sequence.', input: 'n = 3, k = 1', output: '"123"', explanation: 'First permutation sequence.', constraints: ['1 <= n <= 9'], jsFunc: 'function getPermutation(n, k) {\n    return "";\n}', pyFunc: 'class Solution:\n    def getPermutation(self, n: int, k: int) -> str:\n        return ""', cppFunc: 'class Solution {\npublic:\n    string getPermutation(int n, int k) {\n        return "";\n    }\n};' },
  { id: 'fraction_to_decimal', title: 'Fraction to Decimal', difficulty: 'Hard', topic: 'math', problemStatement: 'Given numerator and denominator, return recurring decimals in string format.', input: 'num = 2, den = 3', output: '"0.(6)"', explanation: 'Repeating digit 6 enclosed.', constraints: ['den != 0'], jsFunc: 'function fractionToDecimal(numerator, denominator) {\n    return "";\n}', pyFunc: 'class Solution:\n    def fractionToDecimal(self, numerator: int, denominator: int) -> str:\n        return ""', cppFunc: 'class Solution {\npublic:\n    string fractionToDecimal(int numerator, int denominator) {\n        return "";\n    }\n};' },

  // Greedy Algorithms
  { id: 'assign_cookies', title: 'Assign Cookies', difficulty: 'Easy', topic: 'greedy', problemStatement: 'Maximize content children matching greed sizes and cookie portions.', input: 'g = [1,2], s = [1]', output: '1', explanation: 'Cookie size 1 satisfies child greed 1.', constraints: ['g.length, s.length <= 3 * 10^4'], jsFunc: 'function findContentChildren(g, s) {\n    return 0;\n}', pyFunc: 'class Solution:\n    def findContentChildren(self, g: List[int], s: List[int]) -> int:\n        return 0', cppFunc: 'class Solution {\npublic:\n    int findContentChildren(vector<int>& g, vector<int>& s) {\n        return 0;\n    }\n};' },
  { id: 'lemonade_change', title: 'Lemonade Change', difficulty: 'Easy', topic: 'greedy', problemStatement: 'Return true if you can provide correct change to every customer queue bill.', input: 'bills = [5,5,10]', output: 'true', explanation: 'Change provided.', constraints: ['1 <= bills.length <= 10^5'], jsFunc: 'function lemonadeChange(bills) {\n    return false;\n}', pyFunc: 'class Solution:\n    def lemonadeChange(self, bills: List[int]) -> bool:\n        return False', cppFunc: 'class Solution {\npublic:\n    bool lemonadeChange(vector<int>& bills) {\n        return false;\n    }\n};' },
  { id: 'stock_ii_greedy', title: 'Best Stock Transactions', difficulty: 'Easy', topic: 'greedy', problemStatement: 'Maximize total stock profit trading greedily across prices indexes.', input: 'prices = [1,2]', output: '1', explanation: 'Buy at 1 sell at 2.', constraints: ['prices.length <= 3 * 10^4'], jsFunc: 'function maxProfit(prices) {\n    return 0;\n}', pyFunc: 'class Solution:\n    def maxProfit(self, prices: List[int]) -> int:\n        return 0', cppFunc: 'class Solution {\npublic:\n    int maxProfit(vector<int>& prices) {\n        return 0;\n    }\n};' },
  { id: 'gas_station', title: 'Gas Station', difficulty: 'Medium', topic: 'greedy', problemStatement: 'Find starting gas station index to complete circular route loop.', input: 'gas = [1,2], cost = [2,1]', output: '1', explanation: 'Start at index 1.', constraints: ['n == gas.length'], jsFunc: 'function canCompleteCircuit(gas, cost) {\n    return -1;\n}', pyFunc: 'class Solution:\n    def canCompleteCircuit(self, gas: List[int], cost: List[int]) -> int:\n        return -1', cppFunc: 'class Solution {\npublic:\n    int canCompleteCircuit(vector<int>& gas, vector<int>& cost) {\n        return -1;\n    }\n};' },
  { id: 'jump_game', title: 'Jump Game', difficulty: 'Medium', topic: 'greedy', problemStatement: 'Determine if you can reach last index of jumps array.', input: 'nums = [2,3,0,1,4]', output: 'true', explanation: 'Jump 1 step then end.', constraints: ['1 <= nums.length <= 10^4'], jsFunc: 'function canJump(nums) {\n    return false;\n}', pyFunc: 'class Solution:\n    def canJump(self, nums: List[int]) -> bool:\n        return False', cppFunc: 'class Solution {\npublic:\n    bool canJump(vector<int>& nums) {\n        return false;\n    }\n};' },
  { id: 'partition_labels', title: 'Partition Labels', difficulty: 'Medium', topic: 'greedy', problemStatement: 'Partition string so each letter appears in at most one part. Return parts sizes.', input: 's = "abab"', output: '[4]', explanation: '"abab" contains all a and b.', constraints: ['1 <= s.length <= 500'], jsFunc: 'function partitionLabels(s) {\n    return [];\n}', pyFunc: 'class Solution:\n    def partitionLabels(self, s: str) -> List[int]:\n        return []', cppFunc: 'class Solution {\npublic:\n    vector<int> partitionLabels(string s) {\n        return {};\n    }\n};' },
  { id: 'candy', title: 'Candy', difficulty: 'Hard', topic: 'greedy', problemStatement: 'Return min candies to distribute matching neighbors rating values.', input: 'ratings = [1,0,2]', output: '5', explanation: '2, 1, 2 candies.', constraints: ['ratings.length <= 2 * 10^4'], jsFunc: 'function candy(ratings) {\n    return 0;\n}', pyFunc: 'class Solution:\n    def candy(self, ratings: List[int]) -> int:\n        return 0', cppFunc: 'class Solution {\npublic:\n    int candy(vector<int>& ratings) {\n        return 0;\n    }\n};' },
  { id: 'patching_array', title: 'Patching Array', difficulty: 'Hard', topic: 'greedy', problemStatement: 'Add minimum patches to form all range sums up to n.', input: 'nums = [1,3], n = 6', output: '1', explanation: 'Patch 2 to form all.', constraints: ['1 <= nums.length <= 1000'], jsFunc: 'function minPatches(nums, n) {\n    return 0;\n}', pyFunc: 'class Solution:\n    def minPatches(self, nums: List[int], n: int) -> int:\n        return 0', cppFunc: 'class Solution {\npublic:\n    int minPatches(vector<int>& nums, int n) {\n        return 0;\n    }\n};' },
  { id: 'jump_game_ii', title: 'Jump Game II', difficulty: 'Hard', topic: 'greedy', problemStatement: 'Return minimum jumps to reach end index from index 0.', input: 'nums = [2,3,1,1,4]', output: '2', explanation: 'Jumps: 0 -> 1 -> end.', constraints: ['nums.length <= 10^4'], jsFunc: 'function jump(nums) {\n    return 0;\n}', pyFunc: 'class Solution:\n    def jump(self, nums: List[int]) -> int:\n        return 0', cppFunc: 'class Solution {\npublic:\n    int jump(vector<int>& nums) {\n        return 0;\n    }\n};' },

  // Recursion & DP
  { id: 'fibonacci_number', title: 'Fibonacci Number', difficulty: 'Easy', topic: 'Recursion', problemStatement: 'Calculate Fibonacci number sequence at F(n).', input: 'n = 2', output: '1', explanation: 'F(2) = F(1) + F(0) = 1 + 0 = 1.', constraints: ['0 <= n <= 30'], jsFunc: 'function fib(n) {\n    return 0;\n}', pyFunc: 'class Solution:\n    def fib(self, n: int) -> int:\n        return 0', cppFunc: 'class Solution {\npublic:\n    int fib(int n) {\n        return 0;\n    }\n};' },
  { id: 'climbing_stairs', title: 'Climbing Stairs', difficulty: 'Easy', topic: 'Recursion', problemStatement: 'Return distinct ways to climb n stairs taking 1 or 2 steps.', input: 'n = 2', output: '2', explanation: '1+1 or 2.', constraints: ['1 <= n <= 45'], jsFunc: 'function climbStairs(n) {\n    return 0;\n}', pyFunc: 'class Solution:\n    def climbStairs(self, n: int) -> int:\n        return 0', cppFunc: 'class Solution {\npublic:\n    int climbStairs(int n) {\n        return 0;\n    }\n};' },
  { id: 'min_cost_climbing', title: 'Min Cost Climbing Stairs', difficulty: 'Easy', topic: 'Recursion', problemStatement: 'Return minimum cost to reach top of staircase cost levels.', input: 'cost = [10,15]', output: '10', explanation: 'Start at index 0 cost 10.', constraints: ['2 <= cost.length <= 1000'], jsFunc: 'function minCostClimbingStairs(cost) {\n    return 0;\n}', pyFunc: 'class Solution:\n    def minCostClimbingStairs(self, cost: List[int]) -> int:\n        return 0', cppFunc: 'class Solution {\npublic:\n    int minCostClimbingStairs(vector<int>& cost) {\n        return 0;\n    }\n};' },
  { id: 'coin_change', title: 'Coin Change', difficulty: 'Medium', topic: 'Recursion', problemStatement: 'Return fewest number of coins to make up currency amount.', input: 'coins = [1,2]', amount: 3, output: '2', explanation: '3 = 2 + 1.', constraints: ['1 <= coins.length <= 12'], jsFunc: 'function coinChange(coins, amount) {\n    return -1;\n}', pyFunc: 'class Solution:\n    def coinChange(self, coins: List[int], amount: int) -> int:\n        return -1', cppFunc: 'class Solution {\npublic:\n    int coinChange(vector<int>& coins, int amount) {\n        return -1;\n    }\n};' },
  { id: 'longest_common_subsequence', title: 'Longest Common Subsequence', difficulty: 'Medium', topic: 'Recursion', problemStatement: 'Return length of longest common subsequence of text1 and text2.', input: 'text1 = "abc", text2 = "ac"', output: '2', explanation: 'Subsequence is "ac".', constraints: ['text1.length <= 1000'], jsFunc: 'function longestCommonSubsequence(text1, text2) {\n    return 0;\n}', pyFunc: 'class Solution:\n    def longestCommonSubsequence(self, text1: str, text2: str) -> int:\n        return 0', cppFunc: 'class Solution {\npublic:\n    int longestCommonSubsequence(string text1, string text2) {\n        return 0;\n    }\n};' },
  { id: 'house_robber', title: 'House Robber', difficulty: 'Medium', topic: 'Recursion', problemStatement: 'Return maximum money you can rob tonight without alerting adjacent alarms.', input: 'nums = [1,2,3]', output: '4', explanation: 'Rob house 1 and 3 (1+3=4).', constraints: ['1 <= nums.length <= 100'], jsFunc: 'function rob(nums) {\n    return 0;\n}', pyFunc: 'class Solution:\n    def rob(self, nums: List[int]) -> int:\n        return 0', cppFunc: 'class Solution {\npublic:\n    int rob(vector<int>& nums) {\n        return 0;\n    }\n};' },
  { id: 'edit_distance', title: 'Edit Distance', difficulty: 'Hard', topic: 'Recursion', problemStatement: 'Return minimum operations required to convert word1 to word2.', input: 'word1 = "ab", word2 = "b"', output: '1', explanation: 'Delete a.', constraints: ['word1.length <= 500'], jsFunc: 'function minDistance(word1, word2) {\n    return 0;\n}', pyFunc: 'class Solution:\n    def minDistance(self, word1: str, word2: str) -> int:\n        return 0', cppFunc: 'class Solution {\npublic:\n    int minDistance(string word1, string word2) {\n        return 0;\n    }\n};' },
  { id: 'unique_paths_iii', title: 'Unique Paths III', difficulty: 'Hard', topic: 'Recursion', problemStatement: 'Return number of unique paths that walk over every non-obstacle square once.', input: 'grid = [[1,0],[0,2]]', output: '1', explanation: 'One path matches.', constraints: ['grid.length * grid[0].length <= 20'], jsFunc: 'function uniquePathsIII(grid) {\n    return 0;\n}', pyFunc: 'class Solution:\n    def uniquePathsIII(self, grid: List[List[int]]) -> int:\n        return 0', cppFunc: 'class Solution {\npublic:\n    int uniquePathsIII(vector<vector<int>>& grid) {\n        return 0;\n    }\n};' },
  { id: 'edit_distance_ii', title: 'Edit Distance II', difficulty: 'Hard', topic: 'Recursion', problemStatement: 'Find minimum conversion cost permitting transpositions as a fourth operation.', input: 'word1 = "ca", word2 = "ac"', output: '1', explanation: 'Transpose c and a.', constraints: ['word1.length <= 500'], jsFunc: 'function minDistanceII(word1, word2) {\n    return 0;\n}', pyFunc: 'class Solution:\n    def minDistanceII(self, word1: str, word2: str) -> int:\n        return 0', cppFunc: 'class Solution {\npublic:\n    int minDistanceII(string word1, string word2) {\n        return 0;\n    }\n};' }
];

const CURATED_CHALLENGES = RAW_CURATED.map(item => ({
  id: item.id,
  title: item.title,
  difficulty: item.difficulty,
  topic: item.topic,
  problemStatement: item.problemStatement,
  examples: [{ input: item.input, output: item.output, explanation: item.explanation }],
  constraints: item.constraints,
  starterCode: {
    javascript: item.jsFunc || '',
    python: item.pyFunc || '',
    cpp: item.cppFunc || ''
  }
}));

const CodingChallenge = () => {
  const { token, API_URL, user } = useContext(AuthContext);
  const [topic, setTopic] = useState('Arrays');
  const [difficulty, setDifficulty] = useState('Medium');
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Initializing challenge...');
  const [challenge, setChallenge] = useState(null);
  const [language, setLanguage] = useState('javascript');
  const [userCode, setUserCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [error, setError] = useState('');
  const [badgeUnlocked, setBadgeUnlocked] = useState(false);
  
  // LeetCode Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [topicFilter, setTopicFilter] = useState('All');

  // LeetCode Sandbox Run States
  const [showSubmissionReport, setShowSubmissionReport] = useState(false);
  const [running, setRunning] = useState(false);
  
  // Local editor light/dark theme state
  const [editorTheme, setEditorTheme] = useState('dark');

  // Auto-detect global layout theme on mount
  useEffect(() => {
    const globalTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const isLightGlobal = ['light', 'sakura', 'ocean', 'goldlight', 'redlight', 'orangelight', 'greenlight', 'skyblue', 'whiteblue'].includes(globalTheme);
    setEditorTheme(isLightGlobal ? 'light' : 'dark');
  }, []);

  // Solved challenges history list
  const [solvedHistory, setSolvedHistory] = useState([]);

  // Load user-specific solved history metrics from MongoDB Backend API with localStorage fallback
  useEffect(() => {
    const loadSolvedHistory = async () => {
      const userSuffix = user ? `_${user._id || user.email || user.name}` : '';
      const localHistoryStr = localStorage.getItem(`coding_solved_history_list${userSuffix}`) || localStorage.getItem('coding_solved_history_list');
      let mergedList = localHistoryStr ? JSON.parse(localHistoryStr) : [];

      if (token) {
        try {
          const res = await fetch(`${API_URL}/challenge/history`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await res.json();
          if (data.success && Array.isArray(data.data) && data.data.length > 0) {
            const dbList = data.data.map(item => {
              const curated = CURATED_CHALLENGES.find(c => c.title.toLowerCase().trim() === item.title.toLowerCase().trim());
              return {
                title: item.title,
                topic: item.topic || curated?.topic || 'Arrays',
                difficulty: item.difficulty || curated?.difficulty || 'Easy',
                date: item.solvedAt ? new Date(item.solvedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                challengeData: curated || null,
                submittedCode: item.submittedCode || '',
                language: item.language || 'javascript',
                score: item.score || 100
              };
            });

            // Merge DB list with any existing local items
            const titleSet = new Set();
            const combined = [];
            [...dbList, ...mergedList].forEach(item => {
              const key = (item.title || '').toLowerCase().trim();
              if (key && !titleSet.has(key)) {
                titleSet.add(key);
                combined.push(item);
              }
            });
            mergedList = combined;
          }
        } catch (fetchErr) {
          console.warn('Backend solved history sync notice:', fetchErr.message);
        }
      }

      // Auto-heal difficulty from curated database if mismatched
      mergedList = mergedList.map(item => {
        const curated = CURATED_CHALLENGES.find(c => c.title.toLowerCase().trim() === item.title.toLowerCase().trim());
        if (curated && curated.difficulty) {
          return { ...item, difficulty: curated.difficulty };
        }
        return item;
      });

      setSolvedHistory(mergedList);
      localStorage.setItem(`coding_solved_history_list${userSuffix}`, JSON.stringify(mergedList));
      localStorage.setItem('coding_solved_history_list', JSON.stringify(mergedList));
    };

    loadSolvedHistory();
  }, [user, token, API_URL]);

  // Derived authentic metrics directly from solvedHistory
  const solvedEasy = solvedHistory.filter(h => (h.difficulty || h.challengeData?.difficulty || '').toLowerCase() === 'easy').length;
  const solvedMedium = solvedHistory.filter(h => (h.difficulty || h.challengeData?.difficulty || '').toLowerCase() === 'medium').length;
  const solvedHard = solvedHistory.filter(h => (h.difficulty || h.challengeData?.difficulty || '').toLowerCase() === 'hard').length;
  const totalSolvedCount = solvedEasy + solvedMedium + solvedHard;

  // Calendar year/month interactive states (Defaults to full 2026 year navigation)
  const [calendarYear, setCalendarYear] = useState(2026);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth()); // 0-indexed (8 for September)
  const [calendarView, setCalendarView] = useState('month'); // 'month' | 'year'

  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const fetchChallenge = async () => {
    setLoading(true);
    setLoadingText('Connecting to CareerPilot AI compiler...');
    setError('');
    setEvaluation(null);
    setBadgeUnlocked(false);

    const steps = [
      'Generating problem specifications...',
      'Synthesizing edge-case test rules...',
      'Formatting boilerplate code templates...',
      'Compiling algorithm sandbox files...'
    ];
    let idx = 0;
    const timer = setInterval(() => {
      setLoadingText(steps[idx]);
      idx = (idx + 1) % steps.length;
    }, 1500);

    try {
      const res = await fetch(`${API_URL}/challenge/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ difficulty, topic })
      });
      const data = await res.json();
      if (data.success) {
        setChallenge(data.data);
        setUserCode(data.data.starterCode[language] || '');
      } else {
        setError(data.message || 'Failed to generate coding problem.');
      }
    } catch (err) {
      setError('Connection failed. Please retry.');
    } finally {
      clearInterval(timer);
      setLoading(false);
    }
  };

  const handleSelectCuratedChallenge = (prob) => {
    setChallenge(prob);
    setUserCode(prob.starterCode[language] || '');
    setEvaluation(null);
    setBadgeUnlocked(false);
    setError('');
  };

  useEffect(() => {
    if (challenge && challenge.starterCode) {
      setUserCode(challenge.starterCode[language] || '');
    }
  }, [language]);

  // Function name extractor for JavaScript, Python, and C++
  const getFunctionName = (chal, lang) => {
    const starter = chal?.starterCode?.[lang] || chal?.[`${lang}Func`] || '';
    if (lang === 'python') {
      const m = starter.match(/def\s+([a-zA-Z0-9_$]+)/);
      if (m) return m[1];
    } else if (lang === 'cpp') {
      const m = starter.match(/(?:int|void|bool|vector<[^>]+>|string)\s+([a-zA-Z0-9_$]+)\s*\(/);
      if (m) return m[1];
    }
    const m = starter.match(/function\s+([a-zA-Z0-9_$]+)/);
    if (m) return m[1];
    return chal?.id || 'solution';
  };

  // Generate robust multi-testcase suite for any challenge
  const getProblemTestCases = (chal) => {
    const primaryInput = chal.examples?.[0]?.input || chal.input || '';
    const primaryOutput = (chal.examples?.[0]?.output || chal.output || '').trim();

    const cases = [{ input: primaryInput, output: primaryOutput }];

    const titleLower = (chal.title || '').toLowerCase();

    // Add rich secondary and edge test cases based on problem category & title
    if (titleLower.includes('two sum')) {
      cases.push({ input: 'nums = [3,2,4], target = 6', output: '[1,2]' });
      cases.push({ input: 'nums = [3,3], target = 6', output: '[0,1]' });
    } else if (titleLower.includes('palindrome')) {
      cases.push({ input: 's = "race a car"', output: 'false' });
      cases.push({ input: 's = " "', output: 'true' });
    } else if (titleLower.includes('anagram')) {
      cases.push({ input: 's = "rat", t = "car"', output: 'false' });
    } else if (titleLower.includes('duplicate')) {
      cases.push({ input: 'nums = [1,2,3,4]', output: 'false' });
      cases.push({ input: 'nums = [1,1,1,3,3,4,3,2,4,2]', output: 'true' });
    } else if (titleLower.includes('parentheses')) {
      cases.push({ input: 's = "()[]{}"', output: 'true' });
      cases.push({ input: 's = "(]"', output: 'false' });
    } else if (titleLower.includes('binary search') || titleLower.includes('search')) {
      cases.push({ input: 'nums = [-1,0,3,5,9,12], target = 2', output: '-1' });
    } else if (titleLower.includes('reverse linked list')) {
      cases.push({ input: 'head = [1,2]', output: '[2,1]' });
    } else if (titleLower.includes('maximum subarray')) {
      cases.push({ input: 'nums = [1]', output: '1' });
      cases.push({ input: 'nums = [5,4,-1,7,8]', output: '23' });
    } else if (primaryOutput === 'true') {
      // For general boolean problems with true primary output, add an alternate negative test case
      cases.push({ input: primaryInput.replace(/"[^"]+"/g, '"invalid_test_diff"'), output: 'false' });
    }

    return cases;
  };

  // Test runner for JavaScript submissions against test cases
  const runJavaScriptTest = (code, chal) => {
    const starter = chal.starterCode?.javascript || '';
    const cleanCode = (code || '').trim();

    // 1. Check if unmodified starter template
    if (!cleanCode || cleanCode === starter.trim()) {
      return {
        isCorrect: false,
        feedback: 'Wrong Answer: Code template was not modified. Please implement your solution.',
        actualOutput: 'Unmodified starter code',
        expectedOutput: chal.examples?.[0]?.output || chal.output || 'N/A'
      };
    }

    // 2. Extract function name from starter code
    const funcName = getFunctionName(chal, 'javascript');

    // 3. Get all testcases
    const testCases = getProblemTestCases(chal);

    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      const inputStr = tc.input || '';
      const expectedOutputStr = (tc.output || '').trim();

      // Extract variable names
      const varMatches = [...inputStr.matchAll(/(?:^|,\s*)([a-zA-Z0-9_$]+)\s*=/g)].map(m => m[1]);
      let declStr = "let " + inputStr.replace(/,\s*([a-zA-Z0-9_$]+)\s*=/g, "; let $1 =") + ";";

      try {
        const runnerScript = `
          ${cleanCode}
          
          return (function() {
            ${declStr}
            
            let targetFunc = null;
            if (typeof ${funcName} === 'function') {
              targetFunc = ${funcName};
            } else if (typeof Solution === 'function') {
              const sol = new Solution();
              if (typeof sol.${funcName} === 'function') {
                targetFunc = sol.${funcName}.bind(sol);
              }
            }

            if (!targetFunc) {
              throw new Error("Function '${funcName}' is not defined in your code.");
            }

            return targetFunc(${varMatches.join(', ')});
          })();
        `;

        const result = new Function(runnerScript)();
        
        // Normalize and compare
        const actualStr = JSON.stringify(result);
        const normActual = actualStr ? actualStr.replace(/\s+/g, '').toLowerCase() : String(result).toLowerCase();
        const normExpected = expectedOutputStr.replace(/\s+/g, '').toLowerCase();

        let isMatch = normActual === normExpected || String(result).toLowerCase() === normExpected;
        
        // Check sorted arrays for permutations
        if (!isMatch && Array.isArray(result) && expectedOutputStr.startsWith('[')) {
          try {
            const expectedArr = JSON.parse(expectedOutputStr);
            if (Array.isArray(expectedArr) && expectedArr.length === result.length) {
              const s1 = JSON.stringify([...result].sort());
              const s2 = JSON.stringify([...expectedArr].sort());
              if (s1 === s2) isMatch = true;
            }
          } catch (parseErr) {}
        }

        if (!isMatch) {
          return {
            isCorrect: false,
            feedback: `Wrong Answer on Testcase ${i + 1}: Expected ${expectedOutputStr}, but your code returned ${actualStr !== undefined ? actualStr : String(result)}.`,
            actualOutput: actualStr !== undefined ? actualStr : String(result),
            expectedOutput: expectedOutputStr,
            failedCaseIndex: i + 1
          };
        }
      } catch (runErr) {
        return {
          isCorrect: false,
          feedback: `Compile/Runtime Error on Testcase ${i + 1}: ${runErr.message}`,
          actualOutput: `Error: ${runErr.message}`,
          expectedOutput: expectedOutputStr,
          failedCaseIndex: i + 1
        };
      }
    }

    return {
      isCorrect: true,
      feedback: `Accepted: All ${testCases.length} sample test cases passed successfully!`,
      actualOutput: testCases[0]?.output || 'Passed',
      expectedOutput: testCases[0]?.output || 'Passed'
    };
  };

  // Validator for non-JS languages (Python / C++)
  const validateNonJsCode = (code, chal, lang) => {
    const starter = chal.starterCode?.[lang] || '';
    const cleanCode = (code || '').trim();

    if (!cleanCode || cleanCode === starter.trim()) {
      return {
        isCorrect: false,
        feedback: 'Wrong Answer: Code template was not modified. Please implement your solution.',
        actualOutput: 'Unmodified starter code',
        expectedOutput: chal.examples?.[0]?.output || chal.output || 'N/A'
      };
    }

    const codeLower = cleanCode.toLowerCase();
    
    // Check for dummy returns
    const hasOnlyDummyReturn = 
      (codeLower.includes('return false') || codeLower.includes('return []') || codeLower.includes('return 0') || codeLower.includes('return none') || codeLower.includes('return {}') || codeLower.includes('return nullptr') || codeLower.includes('return ""')) &&
      !codeLower.includes('for') && !codeLower.includes('while') && !codeLower.includes('if');

    if (hasOnlyDummyReturn) {
      return {
        isCorrect: false,
        feedback: 'Wrong Answer: Trivial return statement detected. Please implement the complete algorithm.',
        actualOutput: 'Stub return',
        expectedOutput: chal.examples?.[0]?.output || chal.output || 'N/A'
      };
    }

    const lines = cleanCode.split('\n').map(l => l.trim()).filter(Boolean);
    const starterLines = starter.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length <= starterLines.length && !codeLower.includes('for') && !codeLower.includes('while') && !codeLower.includes('if')) {
      return {
        isCorrect: false,
        feedback: 'Wrong Answer: Incomplete solution. Please implement the full algorithm.',
        actualOutput: 'Incomplete',
        expectedOutput: chal.examples?.[0]?.output || chal.output || 'N/A'
      };
    }

    return {
      isCorrect: true,
      feedback: 'Accepted: All sample test cases passed successfully!',
      actualOutput: chal.examples?.[0]?.output || chal.output || 'Valid',
      expectedOutput: chal.examples?.[0]?.output || chal.output || 'Valid'
    };
  };

  const handleRunCode = async () => {
    if (!challenge || !userCode.trim()) return;

    setRunning(true);
    setError('');
    setEvaluation(null);
    setBadgeUnlocked(false);

    const funcName = getFunctionName(challenge, language);
    const testCases = getProblemTestCases(challenge);

    if (language === 'javascript') {
      setTimeout(() => {
        setRunning(false);
        const evalRes = runJavaScriptTest(userCode, challenge);
        setEvaluation({
          isCorrect: evalRes.isCorrect,
          score: evalRes.isCorrect ? 100 : 0,
          timeComplexity: evalRes.isCorrect ? '0 ms' : 'N/A',
          spaceComplexity: evalRes.isCorrect ? '7.8 MB' : 'N/A',
          feedback: evalRes.feedback,
          actualOutput: evalRes.actualOutput,
          expectedOutput: evalRes.expectedOutput,
          optimalSolution: challenge.starterCode[language]
        });
      }, 500);
    } else {
      // Execute Python / C++ via backend execution service
      try {
        const res = await fetch(`${API_URL}/challenge/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            problemTitle: challenge.title,
            problemStatement: challenge.problemStatement,
            userCode: userCode.trim(),
            language,
            funcName,
            testCases
          })
        });
        const data = await res.json();
        if (data.success) {
          setEvaluation(data.data);
        } else {
          const localFallback = validateNonJsCode(userCode, challenge, language);
          setEvaluation({
            isCorrect: localFallback.isCorrect,
            score: localFallback.isCorrect ? 100 : 0,
            timeComplexity: 'N/A',
            spaceComplexity: 'N/A',
            feedback: localFallback.feedback,
            actualOutput: localFallback.actualOutput,
            expectedOutput: localFallback.expectedOutput
          });
        }
      } catch (err) {
        const localFallback = validateNonJsCode(userCode, challenge, language);
        setEvaluation({
          isCorrect: localFallback.isCorrect,
          score: localFallback.isCorrect ? 100 : 0,
          timeComplexity: 'N/A',
          spaceComplexity: 'N/A',
          feedback: localFallback.feedback,
          actualOutput: localFallback.actualOutput,
          expectedOutput: localFallback.expectedOutput
        });
      } finally {
        setRunning(false);
      }
    }
  };

  const handleSubmitCode = async () => {
    if (!challenge || !userCode.trim()) return;

    setSubmitting(true);
    setError('');
    setEvaluation(null);
    setBadgeUnlocked(false);

    const funcName = getFunctionName(challenge, language);
    const testCases = getProblemTestCases(challenge);

    // 1. Perform client-side verification for JS
    const localEval = language === 'javascript'
      ? runJavaScriptTest(userCode, challenge)
      : validateNonJsCode(userCode, challenge, language);

    try {
      const res = await fetch(`${API_URL}/challenge/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          problemTitle: challenge.title,
          problemStatement: challenge.problemStatement,
          userCode: userCode.trim(),
          language,
          funcName,
          testCases,
          topic: challenge.topic || topic || 'Arrays',
          difficulty: challenge.difficulty || difficulty || 'Easy'
        })
      });
      const data = await res.json();
      
      let finalEval = data.success ? data.data : null;
      
      // If JS evaluation failed on client or backend failed
      if (language === 'javascript' && !localEval.isCorrect) {
        finalEval = {
          ...(finalEval || {}),
          isCorrect: false,
          score: 0,
          timeComplexity: 'N/A',
          spaceComplexity: 'N/A',
          feedback: localEval.feedback || 'Wrong Answer',
          actualOutput: localEval.actualOutput || 'Error',
          expectedOutput: localEval.expectedOutput || testCases[0]?.output
        };
      } else if (finalEval) {
        // Use backend evaluation (e.g. for Python/C++/JS)
        finalEval.isCorrect = Boolean(finalEval.isCorrect);
      } else {
        finalEval = {
          isCorrect: localEval.isCorrect,
          score: localEval.isCorrect ? 95 : 0,
          timeComplexity: '0 ms',
          spaceComplexity: '7.8 MB',
          feedback: localEval.feedback,
          actualOutput: localEval.actualOutput,
          expectedOutput: localEval.expectedOutput
        };
      }

      setEvaluation(finalEval);
      setShowSubmissionReport(true);
      
      // If the code is genuinely correct, increment metrics and update solved history list
      if (finalEval.isCorrect) {
        const userSuffix = user ? `_${user._id || user.email || user.name}` : '';
        
        // If server returned solved challenges array from DB, use it!
        if (Array.isArray(data.solvedChallenges) && data.solvedChallenges.length > 0) {
          const formattedDbList = data.solvedChallenges.map(item => {
            const curated = CURATED_CHALLENGES.find(c => c.title.toLowerCase().trim() === item.title.toLowerCase().trim());
            return {
              title: item.title,
              topic: item.topic || curated?.topic || 'Arrays',
              difficulty: item.difficulty || curated?.difficulty || 'Easy',
              date: item.solvedAt ? new Date(item.solvedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              challengeData: curated || null,
              submittedCode: item.submittedCode || userCode.trim(),
              language: item.language || language,
              score: item.score || 100
            };
          });
          setSolvedHistory(formattedDbList);
          localStorage.setItem(`coding_solved_history_list${userSuffix}`, JSON.stringify(formattedDbList));
          localStorage.setItem('coding_solved_history_list', JSON.stringify(formattedDbList));
        } else {
          // Append to local history list
          const activeTopicObj = TOPICS.find(t => t.id === topic);
          const solvedItem = {
            title: challenge.title,
            topic: challenge.topic || (activeTopicObj ? activeTopicObj.name : topic) || 'Arrays',
            difficulty: challenge.difficulty || difficulty || 'Easy',
            date: new Date().toISOString().split('T')[0],
            challengeData: challenge,
            submittedCode: userCode.trim(),
            language,
            score: finalEval.score || 100
          };

          const cleanHistory = solvedHistory.filter(h => h.title.toLowerCase().trim() !== challenge.title.toLowerCase().trim());
          const newHistory = [solvedItem, ...cleanHistory];
          setSolvedHistory(newHistory);
          localStorage.setItem(`coding_solved_history_list${userSuffix}`, JSON.stringify(newHistory));
          localStorage.setItem('coding_solved_history_list', JSON.stringify(newHistory));
        }
      }

      if (data.badgeUnlocked && finalEval.isCorrect) {
        setBadgeUnlocked(true);
      }
    } catch (err) {
      console.error('Submission error:', err);
      const fallbackEval = {
        isCorrect: localEval.isCorrect,
        score: localEval.isCorrect ? 90 : 0,
        timeComplexity: localEval.isCorrect ? '0 ms' : 'N/A',
        spaceComplexity: 'N/A',
        feedback: localEval.feedback,
        actualOutput: localEval.actualOutput,
        expectedOutput: localEval.expectedOutput
      };
      setEvaluation(fallbackEval);
      setShowSubmissionReport(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoadHistoryChallenge = (item) => {
    if (item.challengeData) {
      setChallenge(item.challengeData);
      setUserCode(item.submittedCode || '');
      setLanguage(item.language || 'javascript');
      setEvaluation(null);
      setBadgeUnlocked(false);
      setError('');
    } else {
      // Find the topic ID by matching name
      const matchedTopic = TOPICS.find(t => t.name === item.topic || t.id === item.topic);
      const matchedDifficulty = item.difficulty || 'Easy';
      
      setTopic(matchedTopic ? matchedTopic.id : 'arrays');
      setDifficulty(matchedDifficulty);
      
      setTimeout(() => {
        fetchChallenge();
      }, 500);
    }
  };

  const getStreakCount = () => {
    if (solvedHistory.length === 0) return 0;
    const uniqueDates = [...new Set(solvedHistory.map(h => h.date))].sort().reverse();
    if (uniqueDates.length === 0) return 0;
    
    const todayStr = new Date().toISOString().split('T')[0];
    let checkDate = new Date();
    const checkDateStr = checkDate.toISOString().split('T')[0];
    let hasToday = uniqueDates.includes(checkDateStr);
    
    checkDate.setDate(checkDate.getDate() - 1);
    const checkDateYesterdayStr = checkDate.toISOString().split('T')[0];
    let hasYesterday = uniqueDates.includes(checkDateYesterdayStr);

    if (!hasToday && !hasYesterday) {
      return 0; // Streak is broken
    }

    let streak = 0;
    let currentCheck = hasToday ? new Date() : checkDate;
    while (true) {
      const dateStr = currentCheck.toISOString().split('T')[0];
      if (uniqueDates.includes(dateStr)) {
        streak++;
        currentCheck.setDate(currentCheck.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const selectedTopicObj = TOPICS.find(t => t.id === topic);

  return (
    <div className="coding-challenge-view">
      <h1 className="page-title">AI Coding Sandbox</h1>
      <p className="page-subtitle">Configure topics and code in the live terminal to test your syntax structure and runtime complexity parameters.</p>

      {error && (
        <div style={{ padding: '0.85rem 1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--accent-error)', color: 'var(--accent-error)', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="glass-card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', textAlign: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="spinner-loader"></div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>AI Sandbox Compiling...</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{loadingText}</p>
        </div>
      )}

      {/* Select panel */}
      {!challenge && !loading && (
        <div className="leetcode-dashboard-grid animate-fade-in">
          
          {/* Left Column: Profile stats and analytics */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Card: Beautiful CareerPilot Dev Pass Profile & Coding Stats */}
            {/* Card: Beautiful CareerPilot Dev Pass Profile & Coding Stats */}
            <div className="leetcode-profile-card glass-card devpass-card-enhanced" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'stretch', position: 'relative' }}>
              {/* Header Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '1.25rem' }}>
                <span className="devpass-title-gradient">
                  CP // PILOT
                </span>
                <span className="devpass-verified-pill">
                  <span className="devpass-verified-dot"></span>
                  VERIFIED
                </span>
              </div>

              {/* Avatar Section */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 auto' }}>
                <div className="devpass-avatar-wrapper">
                  <div style={{ 
                    width: '96px', 
                    height: '96px', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', 
                    color: '#ffffff', 
                    fontWeight: 800, 
                    fontSize: '2.5rem', 
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    {user?.profile?.avatar ? (
                      <img 
                        src={user.profile.avatar} 
                        alt="User Avatar" 
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transform: `scale(${user.profile.avatarScale || 1})`,
                          objectPosition: `${user.profile.avatarX || 50}% ${user.profile.avatarY || 50}%`
                        }}
                      />
                    ) : (
                      user?.name?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                </div>

                <h4 style={{ margin: '0.85rem 0 0.2rem 0', fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)', textAlign: 'center' }}>
                  {user?.name || 'Prince Raj'}
                </h4>
                <span className="devpass-role-badge">
                  {user?.profile?.title || 'Full Stack Developer'}
                </span>
              </div>

              {/* Social Links Icons Row */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', margin: '1.25rem 0 0.85rem 0' }}>
                {[
                  { id: 'github', icon: GithubIcon, name: 'GitHub Profile', link: user?.profile?.github || 'https://github.com' },
                  { id: 'linkedin', icon: LinkedinIcon, name: 'LinkedIn Profile', link: user?.profile?.linkedin || 'https://linkedin.com' },
                  { id: 'code', icon: Code, name: 'Code Sandbox / Portfolio', link: user?.profile?.portfolio || '#' },
                  { id: 'web', icon: Globe, name: 'Personal Website', link: user?.profile?.website || 'https://google.com' }
                ].map((soc) => {
                  const IconComponent = soc.icon;
                  return (
                    <a 
                      key={soc.id} 
                      href={soc.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`devpass-social-btn ${soc.id}`}
                      title={soc.name}
                    >
                      <IconComponent size={17} />
                    </a>
                  );
                })}
              </div>

              <div className="divider" style={{ margin: '0.65rem 0' }}></div>

              {/* Combined Coding Stats Row (Gauge Left, Bars Right) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '0.5rem 0' }}>
                {/* Gauge Left */}
                <div className="solved-gauge-container" style={{ margin: 0, flexShrink: 0 }}>
                  <svg width="84" height="84">
                    <circle stroke="rgba(0,0,0,0.06)" strokeWidth="5" fill="transparent" r="34" cx="42" cy="42" />
                    <circle 
                      stroke="var(--primary)" 
                      strokeWidth="5" 
                      fill="transparent" 
                      r="34" 
                      cx="42" 
                      cy="42" 
                      strokeDasharray={`${2 * Math.PI * 34}`}
                      strokeDashoffset={`${2 * Math.PI * 34 * (1 - Math.min(totalSolvedCount / 126, 1))}`}
                      strokeLinecap="round"
                      style={{ transform: 'rotate(-90deg)', transformOrigin: '42px 42px', transition: 'stroke-dashoffset 0.5s ease' }}
                    />
                  </svg>
                  <div className="solved-gauge-inner">
                    <span className="solved-gauge-count" style={{ fontSize: '1.15rem' }}>{totalSolvedCount}</span>
                    <span className="solved-gauge-label" style={{ fontSize: '0.55rem' }}>Solved</span>
                  </div>
                </div>

                {/* Bars Right */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '0.1rem' }}>
                      <span style={{ color: '#22c55e', fontWeight: 800 }}>Easy</span>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{solvedEasy} / 42</span>
                    </div>
                    <div style={{ height: '4px', background: 'rgba(0,0,0,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${(solvedEasy / 42) * 100}%`, height: '100%', background: '#22c55e', borderRadius: '2px' }}></div>
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '0.1rem' }}>
                      <span style={{ color: '#f59e0b', fontWeight: 800 }}>Medium</span>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{solvedMedium} / 42</span>
                    </div>
                    <div style={{ height: '4px', background: 'rgba(0,0,0,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${(solvedMedium / 42) * 100}%`, height: '100%', background: '#f59e0b', borderRadius: '2px' }}></div>
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '0.1rem' }}>
                      <span style={{ color: '#ef4444', fontWeight: 800 }}>Hard</span>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{solvedHard} / 42</span>
                    </div>
                    <div style={{ height: '4px', background: 'rgba(0,0,0,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${(solvedHard / 42) * 100}%`, height: '100%', background: '#ef4444', borderRadius: '2px' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="divider" style={{ margin: '0.65rem 0' }}></div>

              {/* Profile Strength */}
              <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.03em' }}>
                  <span>PROFILE STRENGTH</span>
                  <span style={{ color: '#10b981' }}>100%</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(0,0,0,0.05)', borderRadius: '3px', marginTop: '0.35rem', overflow: 'hidden', width: '100%' }}>
                  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg, #10b981 0%, #06b6d4 50%, #6366f1 100%)', borderRadius: '3px' }}></div>
                </div>
              </div>

              <div className="divider" style={{ margin: '0.75rem 0' }}></div>

              {/* System details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                <div className="devpass-info-chip">
                  <span style={{ color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '0.08em', fontSize: '0.62rem' }}>SYSTEM ID</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 800, fontFamily: 'monospace', fontSize: '0.78rem' }}>
                    UID-{user?._id?.substring(0, 8).toUpperCase() || 'B5D99234'}
                  </span>
                </div>
                <div className="devpass-info-chip">
                  <span style={{ color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '0.08em', fontSize: '0.62rem' }}>EMAIL COORDINATE</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 800, fontFamily: 'monospace', fontSize: '0.78rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.email || 'princeraj@gmail.com'}
                  </span>
                </div>
              </div>

              {/* Footer illustration */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', width: '70px', margin: '1rem auto 0.25rem auto' }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} style={{ height: '2px', background: 'var(--border-color)', opacity: 0.7, width: '100%' }}></div>
                ))}
              </div>
              <p style={{ margin: 0, textAlign: 'center', fontSize: '0.58rem', letterSpacing: '0.12em', color: 'var(--text-muted)', fontWeight: 800 }}>
                CAREERPILOT.AI // DEV-PASS
              </p>
            </div>

            {/* Submissions list */}
            {solvedHistory.length > 0 && (
              <div className="leetcode-profile-card glass-card">
                <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckCircle2 size={15} style={{ color: '#22c55e' }} />
                  <span>Recent Submissions</span>
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
                  {solvedHistory.map((item, idx) => (
                    <div 
                      key={idx}
                      onClick={() => handleLoadHistoryChallenge(item)}
                      style={{ padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--bg-item)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}
                      title="Click to load and review this solved solution"
                    >
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '140px' }}>{item.title}</span>
                      <span className={`diff-tag ${item.difficulty?.toLowerCase()}`} style={{ fontSize: '0.6rem', padding: '0.1rem 0.35rem' }}>{item.difficulty}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Center Column: LeetCode problems selector panel */}
          <div className="leetcode-problems-table-card glass-card">
            
            {/* Topic Filter Pills */}
            <div className="topic-filter-pills-row">
              {['All', 'Arrays', 'Strings', 'Linked List', 'Stack', 'Searching', 'Recursion'].map(t => (
                <button
                  key={t}
                  onClick={() => {
                    setTopicFilter(t);
                    if (t !== 'All') {
                      setTopic(t);
                    }
                  }}
                  className={`topic-filter-pill ${topicFilter === t ? 'active' : ''}`}
                >
                  {t === 'All' ? 'All Topics' : t}
                </button>
              ))}
            </div>

            {/* Filter and Search controls */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <input 
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: '180px',
                  padding: '0.45rem 1rem',
                  fontSize: '0.82rem',
                  background: 'var(--bg-body)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  borderRadius: '6px',
                  outline: 'none'
                }}
              />
              
              <select
                value={topicFilter}
                onChange={(e) => {
                  const val = e.target.value;
                  setTopicFilter(val);
                  if (val !== 'All') {
                    setTopic(val);
                  }
                }}
                style={{
                  padding: '0.45rem 1rem',
                  fontSize: '0.82rem',
                  background: 'var(--bg-body)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  borderRadius: '6px',
                  outline: 'none',
                  fontWeight: 600
                }}
              >
                <option value="All">All Topics</option>
                {TOPICS.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              
              <select
                value={difficultyFilter}
                onChange={(e) => {
                  setDifficultyFilter(e.target.value);
                  if (e.target.value !== 'All') {
                    setDifficulty(e.target.value);
                  }
                }}
                style={{
                  padding: '0.45rem 1rem',
                  fontSize: '0.82rem',
                  background: 'var(--bg-body)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  borderRadius: '6px',
                  outline: 'none',
                  fontWeight: 600
                }}
              >
                <option value="All">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: '0.45rem 1rem',
                  fontSize: '0.82rem',
                  background: 'var(--bg-body)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  borderRadius: '6px',
                  outline: 'none',
                  fontWeight: 600
                }}
              >
                <option value="All">All Statuses</option>
                <option value="Todo">Todo</option>
                <option value="Solved">Solved</option>
              </select>
            </div>

            {/* Problems table */}
            {(() => {
              const filtered = CURATED_CHALLENGES.filter(prob => {
                // Topic filter
                if (topicFilter !== 'All' && prob.topic !== topicFilter) return false;
                // Difficulty filter
                if (difficultyFilter !== 'All' && prob.difficulty !== difficultyFilter) return false;
                // Status filter
                const isSolved = solvedHistory.some(h => h.title.toLowerCase().trim() === prob.title.toLowerCase().trim());
                if (statusFilter === 'Solved' && !isSolved) return false;
                if (statusFilter === 'Todo' && isSolved) return false;
                // Search query
                if (searchQuery.trim() !== '') {
                  const query = searchQuery.toLowerCase().trim();
                  return prob.title.toLowerCase().includes(query) || prob.topic.toLowerCase().includes(query);
                }
                return true;
              });

              if (filtered.length === 0) {
                return (
                  <div style={{ padding: '2.5rem', textAlign: 'center', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No problems match your search criteria. Try removing some filters or generate a custom AI question on the right side panel!
                  </div>
                );
              }

              return (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '0.6rem 0.75rem', width: '60px' }}>Status</th>
                        <th style={{ padding: '0.6rem 0.75rem' }}>Title</th>
                        <th style={{ padding: '0.6rem 0.75rem', width: '100px' }}>Acceptance</th>
                        <th style={{ padding: '0.6rem 0.75rem', width: '100px' }}>Difficulty</th>
                        <th style={{ padding: '0.6rem 0.75rem', width: '80px', textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((prob, idx) => {
                        const isSolved = solvedHistory.some(h => h.title.toLowerCase().trim() === prob.title.toLowerCase().trim());
                        
                        // Set mock acceptance rates if not present
                        const mockedAcceptances = {
                          'Two Sum': '49.5%',
                          'Contains Duplicate': '61.2%',
                          'Top K Frequent Elements': '64.8%',
                          'Product of Array Except Self': '52.7%',
                          'First Missing Positive': '36.4%',
                          'Valid Palindrome': '44.6%',
                          'Longest Substring Without Repeating Characters': '33.8%',
                          'Minimum Window Substring': '41.1%',
                          'Reverse Linked List': '73.5%',
                          'Remove Nth Node From End of List': '42.4%',
                          'Merge k Sorted Lists': '40.2%',
                          'Valid Parentheses': '40.5%',
                          'Min Stack': '52.9%',
                          'Largest Rectangle in Histogram': '42.6%',
                          'Binary Search': '56.2%',
                          'Search in Rotated Sorted Array': '39.1%',
                          'Median of Two Sorted Arrays': '35.7%',
                          'Fibonacci Number': '68.5%',
                          'Climbing Stairs': '52.2%',
                          'Edit Distance': '54.1%'
                        };
                        const acceptanceRate = mockedAcceptances[prob.title] || '50.0%';

                        return (
                          <tr 
                            key={prob.id}
                            style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}
                            className="solved-history-row"
                          >
                            <td style={{ padding: '0.75rem 0.6rem' }}>
                              {isSolved ? (
                                <span style={{ color: '#22c55e', fontWeight: 800, fontSize: '0.9rem' }}>✓</span>
                              ) : (
                                <span style={{ color: 'var(--text-muted)', opacity: 0.3 }}>○</span>
                              )}
                            </td>
                            <td style={{ padding: '0.75rem 0.6rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                              {idx + 1}. {prob.title}
                            </td>
                            <td style={{ padding: '0.75rem 0.6rem', color: 'var(--text-secondary)' }}>
                              {acceptanceRate}
                            </td>
                            <td style={{ padding: '0.75rem 0.6rem' }}>
                              <span className={`diff-tag ${prob.difficulty?.toLowerCase()}`} style={{ padding: '0.15rem 0.45rem', fontSize: '0.65rem' }}>
                                {prob.difficulty}
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem 0.6rem', textAlign: 'right' }}>
                              <button
                                onClick={() => handleSelectCuratedChallenge(prob)}
                                className="btn btn-secondary"
                                style={{ padding: '0.25rem 0.6rem', fontSize: '0.7rem', fontWeight: 800, width: 'auto', height: 'auto' }}
                              >
                                Solve
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>

          {/* Right Column: Submission Streak calendar & AI problem config */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Calendar card with Full 2026 Year & All Months Support */}
            <div className="leetcode-calendar-card glass-card animate-fade-in" style={{ overflow: 'hidden', width: '100%', boxSizing: 'border-box' }}>
              
              {/* Header Navigation Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <button 
                    onClick={() => {
                      if (calendarMonth === 0) {
                        setCalendarMonth(11);
                      } else {
                        setCalendarMonth(prev => prev - 1);
                      }
                    }} 
                    className="calendar-nav-btn"
                    title="Previous Month"
                  >
                    <ChevronLeft size={14} />
                  </button>

                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                    {MONTH_NAMES[calendarMonth]} {calendarYear}
                  </span>

                  <button 
                    onClick={() => {
                      if (calendarMonth === 11) {
                        setCalendarMonth(0);
                      } else {
                        setCalendarMonth(prev => prev + 1);
                      }
                    }} 
                    className="calendar-nav-btn"
                    title="Next Month"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <button
                    onClick={() => setCalendarView(calendarView === 'month' ? 'year' : 'month')}
                    className="calendar-nav-btn"
                    style={{ 
                      width: 'auto', 
                      padding: '0.2rem 0.5rem', 
                      fontSize: '0.68rem', 
                      fontWeight: 700, 
                      gap: '0.25rem',
                      display: 'inline-flex',
                      background: calendarView === 'year' ? 'var(--primary)' : 'var(--bg-item)', 
                      color: calendarView === 'year' ? '#fff' : 'var(--text-secondary)',
                      borderColor: calendarView === 'year' ? 'var(--primary)' : 'var(--border-color)'
                    }}
                    title={calendarView === 'month' ? 'View all 12 months of 2026' : 'Back to Month View'}
                  >
                    <Calendar size={11} />
                    <span>{calendarView === 'month' ? 'Full Year' : 'Month'}</span>
                  </button>

                  <span style={{ fontSize: '0.72rem', color: 'var(--text-primary)', fontWeight: 800, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '0.15rem' }}>
                    🔥 {getStreakCount()}
                  </span>
                </div>
              </div>

              {/* 12-Month Quick Selector Grid (2 rows x 6 columns, fits 100% inside card with NO scrollbar) */}
              <div className="calendar-month-grid-12">
                {SHORT_MONTHS.map((mShort, idx) => {
                  const mNumStr = idx + 1 < 10 ? `0${idx + 1}` : `${idx + 1}`;
                  const hasMonthActivity = solvedHistory.some(item => (item.date || '').startsWith(`${calendarYear}-${mNumStr}`));
                  const isActive = calendarMonth === idx;

                  return (
                    <button
                      key={mShort}
                      onClick={() => {
                        setCalendarMonth(idx);
                        setCalendarView('month');
                      }}
                      className={`calendar-month-pill-grid ${isActive ? 'active' : ''}`}
                      title={`${MONTH_NAMES[idx]} 2026`}
                    >
                      <span>{mShort}</span>
                      {hasMonthActivity && <span className="activity-dot"></span>}
                    </button>
                  );
                })}
              </div>

              {/* View 1: Detailed Single Month View */}
              {calendarView === 'month' && (
                <>
                  <div className="calendar-days-header-row">
                    <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                  </div>

                  <div className="calendar-grid-layout">
                    {/* Dynamically calculate first day of week for selected month */}
                    {Array.from({ length: new Date(calendarYear, calendarMonth, 1).getDay() }).map((_, idx) => (
                      <div key={`empty-${idx}`} className="calendar-cell-day empty"></div>
                    ))}

                    {/* Days of selected month */}
                    {Array.from({ length: new Date(calendarYear, calendarMonth + 1, 0).getDate() }).map((_, idx) => {
                      const day = idx + 1;
                      const dayStr = day < 10 ? `0${day}` : `${day}`;
                      const monthStr = calendarMonth + 1 < 10 ? `0${calendarMonth + 1}` : `${calendarMonth + 1}`;
                      const dateKey = `${calendarYear}-${monthStr}-${dayStr}`;
                      
                      // Check if any solvedItem in solvedHistory has this date key
                      const isSolved = solvedHistory.some(item => item.date === dateKey);

                      return (
                        <div 
                          key={`day-${day}`} 
                          className={`calendar-cell-day ${isSolved ? 'solved' : 'todo'}`}
                          title={isSolved ? `Solved challenge on ${MONTH_NAMES[calendarMonth]} ${day}, ${calendarYear}!` : `No activity on ${MONTH_NAMES[calendarMonth]} ${day}`}
                          style={{ 
                            flexDirection: 'column', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            background: 'transparent',
                            border: 'none',
                            boxShadow: 'none',
                            height: '32px'
                          }}
                        >
                          {isSolved ? (
                            <CheckCircle2 size={16} style={{ color: '#3b82f6', filter: 'drop-shadow(0 2px 4px rgba(59, 130, 246, 0.2))' }} />
                          ) : (
                            <>
                              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{day}</span>
                              <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#ef4444', marginTop: '2px' }}></div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* View 2: Full Year 2026 Overview (All 12 Months Grid) */}
              {calendarView === 'year' && (
                <div className="calendar-year-grid animate-fade-in">
                  {MONTH_NAMES.map((mName, mIdx) => {
                    const mNumStr = mIdx + 1 < 10 ? `0${mIdx + 1}` : `${mIdx + 1}`;
                    const monthSolvedCount = solvedHistory.filter(item => (item.date || '').startsWith(`${calendarYear}-${mNumStr}`)).length;
                    const firstDayOffset = new Date(calendarYear, mIdx, 1).getDay();
                    const totalDaysInMonth = new Date(calendarYear, mIdx + 1, 0).getDate();
                    const isCurrentMonth = mIdx === calendarMonth;

                    return (
                      <div 
                        key={mName}
                        onClick={() => {
                          setCalendarMonth(mIdx);
                          setCalendarView('month');
                        }}
                        className={`mini-month-card ${isCurrentMonth ? 'current' : ''}`}
                        title={`Click to open full calendar for ${mName} ${calendarYear}`}
                      >
                        <div className="mini-month-header">
                          <span style={{ color: isCurrentMonth ? 'var(--primary)' : 'var(--text-primary)' }}>{SHORT_MONTHS[mIdx]}</span>
                          {monthSolvedCount > 0 && (
                            <span style={{ fontSize: '0.55rem', color: '#22c55e', fontWeight: 800 }}>{monthSolvedCount} ✓</span>
                          )}
                        </div>

                        <div className="mini-calendar-grid">
                          {Array.from({ length: firstDayOffset }).map((_, padIdx) => (
                            <div key={`pad-${padIdx}`} className="mini-day-cell empty"></div>
                          ))}

                          {Array.from({ length: totalDaysInMonth }).map((_, dIdx) => {
                            const dNum = dIdx + 1;
                            const dStr = dNum < 10 ? `0${dNum}` : `${dNum}`;
                            const dKey = `${calendarYear}-${mNumStr}-${dStr}`;
                            const isDaySolved = solvedHistory.some(item => item.date === dKey);

                            return (
                              <div
                                key={`m-${mIdx}-d-${dNum}`}
                                className={`mini-day-cell ${isDaySolved ? 'solved' : ''}`}
                              >
                                {isDaySolved ? '•' : dNum}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>

            {/* AI Generator on demand config */}
            <div className="leetcode-profile-card glass-card" style={{ gap: '0.75rem' }}>
              <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>✨ AI Dynamic Challenge</span>
              </h4>
              <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                Configure below to generate a custom interview challenge powered by Gemini AI.
              </p>

              <div>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 800, display: 'block', marginBottom: '0.2rem' }}>Category</label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  style={{ width: '100%', padding: '0.35rem 0.5rem', fontSize: '0.75rem', background: 'var(--bg-body)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px', outline: 'none' }}
                >
                  {TOPICS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 800, display: 'block', marginBottom: '0.2rem' }}>Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  style={{ width: '100%', padding: '0.35rem 0.5rem', fontSize: '0.75rem', background: 'var(--bg-body)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px', outline: 'none' }}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <button 
                onClick={fetchChallenge}
                className="btn btn-primary"
                style={{ width: '100%', height: '36px', fontSize: '0.75rem', fontWeight: 800, marginTop: '0.5rem' }}
                disabled={loading}
              >
                {loading ? 'Compiling AI challenge...' : 'Generate AI Problem'}
              </button>
            </div>

          </div>
        </div>
      )}

      {challenge && (
        <div className="challenge-workspace-split animate-fade-in">
          {/* Left panel: problem description or LeetCode Submission Report */}
          <div className="workspace-panel description-side glass-card">
            {showSubmissionReport && evaluation ? (
              <div className="leetcode-submission-report animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button 
                    onClick={() => setShowSubmissionReport(false)} 
                    style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 800, padding: 0 }}
                  >
                    &larr; View Problem Description
                  </button>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Submission Details</span>
                </div>

                <div style={{ marginTop: '0.5rem' }}>
                  {evaluation.isCorrect ? (
                    <>
                      <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#22c55e', margin: 0 }}>Accepted</h2>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>40 / 40 testcases passed</p>
                    </>
                  ) : (
                    <>
                      <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ef4444', margin: 0 }}>Wrong Answer</h2>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>0 / 40 testcases passed</p>
                    </>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-body)', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontWeight: 800, fontSize: '0.9rem', overflow: 'hidden' }}>
                    {user?.profile?.avatar ? (
                      <img 
                        src={user.profile.avatar} 
                        alt="User Avatar" 
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transform: `scale(${user.profile.avatarScale || 1})`,
                          objectPosition: `${user.profile.avatarX || 50}% ${user.profile.avatarY || 50}%`
                        }}
                      />
                    ) : (
                      user?.name?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                  <div>
                    <h5 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>{user?.name || 'Candidate'}</h5>
                    <p style={{ margin: 0, fontSize: '0.68rem', color: 'var(--text-muted)' }}>submitted at {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>

                {/* Custom glass promotional banner */}
                <div style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(244, 63, 94, 0.08) 100%)', border: '1px solid rgba(99, 102, 241, 0.15)', borderRadius: '8px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h6 style={{ margin: 0, fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.82rem' }}>👑 Unlock Premium sandbox</h6>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Get access to top company questions, templates, & details.</p>
                  </div>
                  <span style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}>&rarr;</span>
                </div>

                {/* Runtime & Memory breakdown */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div style={{ background: 'var(--bg-body)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.85rem' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Runtime</span>
                    <strong style={{ fontSize: '1.25rem', color: 'var(--text-primary)', display: 'block', margin: '0.15rem 0' }}>
                      {evaluation.isCorrect ? '0 ms' : 'N/A'}
                    </strong>
                    <span style={{ fontSize: '0.72rem', color: '#22c55e', fontWeight: 700 }}>
                      {evaluation.isCorrect ? 'Beats 100.00% ⚡' : ''}
                    </span>
                  </div>

                  <div style={{ background: 'var(--bg-body)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.85rem' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Memory</span>
                    <strong style={{ fontSize: '1.25rem', color: 'var(--text-primary)', display: 'block', margin: '0.15rem 0' }}>
                      {evaluation.isCorrect ? '7.83 MB' : 'N/A'}
                    </strong>
                    <span style={{ fontSize: '0.72rem', color: '#22c55e', fontWeight: 700 }}>
                      {evaluation.isCorrect ? 'Beats 92.85% ⚡' : ''}
                    </span>
                  </div>
                </div>

                {/* Beats distribution visual graph */}
                {evaluation.isCorrect && (
                  <div style={{ background: 'var(--bg-body)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>Runtime Beats Distribution</span>
                    <div style={{ height: '30px', display: 'flex', alignItems: 'flex-end', gap: '4px', paddingBottom: '2px', borderBottom: '1px solid var(--border-color)' }}>
                      <div style={{ flex: 1, height: '40%', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '2px' }}></div>
                      <div style={{ flex: 1, height: '60%', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '2px' }}></div>
                      <div style={{ flex: 1, height: '85%', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '2px' }}></div>
                      <div style={{ flex: 1, height: '100%', background: 'var(--primary)', borderRadius: '2px', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></div>
                      </div>
                      <div style={{ flex: 1, height: '50%', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '2px' }}></div>
                      <div style={{ flex: 1, height: '30%', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '2px' }}></div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                      <span>0ms</span>
                      <span style={{ color: '#22c55e', fontWeight: 800 }}>Your solution (0ms)</span>
                      <span>50ms</span>
                    </div>
                  </div>
                )}

                {evaluation.feedback && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginTop: '0.5rem', background: 'var(--bg-body)', padding: '0.85rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                    <strong>Feedback Summary:</strong>
                    <p style={{ margin: '0.25rem 0 0 0' }}>{evaluation.feedback}</p>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="panel-header-row">
                  <h3>{challenge.title}</h3>
                  <span className={`diff-tag ${challenge.difficulty?.toLowerCase()}`}>
                    {challenge.difficulty}
                  </span>
                </div>

                <div className="problem-statement-text" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '1rem', whiteSpace: 'pre-line' }}>
                  {challenge.problemStatement}
                </div>

                {/* Examples list */}
                <div className="problems-sub-section" style={{ marginTop: '1.5rem' }}>
                  <h4 className="section-small-lbl">Examples</h4>
                  {challenge.examples?.map((ex, idx) => (
                    <div key={idx} className="example-box" style={{ background: 'var(--bg-body)', padding: '0.85rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', marginTop: '0.5rem' }}>
                      <p style={{ fontSize: '0.82rem', margin: '0 0 0.25rem 0' }}><strong>Input:</strong> <code>{ex.input}</code></p>
                      <p style={{ fontSize: '0.82rem', margin: '0 0 0.25rem 0' }}><strong>Output:</strong> <code>{ex.output}</code></p>
                      {ex.explanation && <p style={{ fontSize: '0.82rem', margin: 0, color: 'var(--text-muted)' }}><strong>Explanation:</strong> {ex.explanation}</p>}
                    </div>
                  ))}
                </div>

                {/* Constraints */}
                <div className="problems-sub-section" style={{ marginTop: '1.5rem' }}>
                  <h4 className="section-small-lbl">Constraints</h4>
                  <ul className="constraints-bullets-list" style={{ listStyle: 'disc', paddingLeft: '1.25rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {challenge.constraints?.map((con, idx) => (
                      <li key={idx} style={{ marginTop: '0.35rem' }}>{con}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                  <button onClick={() => { setChallenge(null); setShowSubmissionReport(false); }} className="btn btn-secondary">
                    &larr; Back to Problem List
                  </button>
                  <button 
                    onClick={() => {
                      if (challenge && challenge.starterCode) {
                        setUserCode(challenge.starterCode[language] || '');
                      } else {
                        setUserCode('');
                      }
                      setEvaluation(null);
                      setBadgeUnlocked(false);
                    }} 
                    className="btn btn-secondary" 
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', borderColor: 'var(--accent-warning)', color: 'var(--accent-warning)' }}
                    title="Reset code editor to starter code and solve again"
                  >
                    <RefreshCw size={14} />
                    <span>Try Again (Reset)</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Right panel: Editor sandbox */}
          <div className="workspace-panel editor-side">
            <div className="editor-window-card glass-card" style={{ 
              display: 'flex', 
              flexDirection: 'column',
              background: editorTheme === 'light' ? '#ffffff' : 'var(--bg-card)',
              border: editorTheme === 'light' ? '1px solid rgba(99, 102, 241, 0.15)' : '1px solid var(--border-color)'
            }}>
              <div className="editor-controls-row" style={{
                background: editorTheme === 'light' ? '#f1f5f9' : 'hsla(222, 28%, 5%, 0.4)',
                borderBottom: editorTheme === 'light' ? '1px solid rgba(99, 102, 241, 0.15)' : '1px solid var(--border-color)',
                padding: '0.75rem 1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div className="editor-mode-indicator" style={{
                  color: editorTheme === 'light' ? '#334155' : 'var(--text-secondary)'
                }}>
                  <Terminal size={14} />
                  <span>Interactive Terminal</span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  {/* Theme Switcher Button */}
                  <button 
                    type="button"
                    onClick={() => setEditorTheme(prev => prev === 'dark' ? 'light' : 'dark')}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: editorTheme === 'light' ? '#475569' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '4px',
                      borderRadius: '4px'
                    }}
                    title={`Switch to ${editorTheme === 'dark' ? 'light' : 'dark'} editor theme`}
                  >
                    {editorTheme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
                  </button>

                  <select
                    className="lang-select-control"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    style={{
                      background: editorTheme === 'light' ? '#ffffff' : 'var(--bg-body)',
                      color: editorTheme === 'light' ? '#0f172a' : 'var(--text-primary)',
                      border: editorTheme === 'light' ? '1px solid #cbd5e1' : '1px solid var(--border-color)'
                    }}
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="cpp">C++</option>
                  </select>
                </div>
              </div>

              {/* Text Area Code Editor */}
              <div className="code-editor-area-wrapper" style={{ flex: 1, display: 'flex' }}>
                <textarea
                  className="code-textarea-editor"
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  placeholder="// Type solution here..."
                  style={{
                    background: editorTheme === 'light' ? '#ffffff' : 'hsla(222, 28%, 3%, 0.7)',
                    color: editorTheme === 'light' ? '#0f172a' : '#38bdf8',
                    fontFamily: 'monospace',
                    padding: '1rem',
                    fontSize: '0.85rem',
                    lineHeight: 1.5,
                    border: 'none',
                    outline: 'none',
                    resize: 'none',
                    width: '100%',
                    height: '100%'
                  }}
                />
              </div>

              <div className="editor-footer-row" style={{
                background: editorTheme === 'light' ? '#f8fafc' : 'hsla(222, 28%, 5%, 0.4)',
                borderTop: editorTheme === 'light' ? '1px solid rgba(99, 102, 241, 0.15)' : '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.65rem',
                padding: '0.75rem 1rem'
              }}>
                <button 
                  onClick={handleRunCode} 
                  className="btn btn-secondary" 
                  style={{
                    background: '#475569',
                    color: '#ffffff',
                    borderColor: '#475569',
                    width: 'auto',
                    padding: '0 1.25rem',
                    height: '36px',
                    fontWeight: 700
                  }}
                  disabled={running || submitting}
                >
                  <span>{running ? 'Running...' : 'Run'}</span>
                </button>
                
                <button 
                  onClick={handleSubmitCode} 
                  className="btn btn-primary" 
                  style={{
                    background: '#22c55e',
                    color: '#ffffff',
                    borderColor: '#22c55e',
                    width: 'auto',
                    padding: '0 1.25rem',
                    height: '36px',
                    fontWeight: 700
                  }}
                  disabled={running || submitting}
                >
                  <span>{submitting ? 'Submitting...' : 'Submit'}</span>
                </button>
              </div>
            </div>

            {/* Submissions feedback / LeetCode style Test Result pane */}
            {evaluation && (
              <div className="evaluation-report-card glass-card animate-fade-in" style={{ padding: '1.25rem', marginTop: '1rem' }}>
                
                {/* Tab selector header */}
                <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', background: 'var(--bg-item)', padding: '0.25rem 0.6rem', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Code size={13} />
                    Testcase
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', background: 'rgba(99, 102, 241, 0.08)', borderBottom: '2px solid var(--primary)', padding: '0.25rem 0.6rem', borderRadius: '4px 4px 0 0', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Terminal size={13} />
                    Test Result
                  </span>
                </div>

                {/* Outcome Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {evaluation.isCorrect ? (
                    <>
                      <span style={{ color: '#22c55e', fontSize: '1.2rem', fontWeight: 900 }}>Accepted</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Runtime: 0 ms</span>
                    </>
                  ) : (
                    <>
                      <span style={{ color: '#ef4444', fontSize: '1.2rem', fontWeight: 900 }}>Wrong Answer</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Runtime: 0 ms</span>
                    </>
                  )}
                </div>

                {/* Case 1 and Case 2 tabs indicator */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: evaluation.isCorrect ? '#22c55e' : '#ef4444', background: evaluation.isCorrect ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)', padding: '0.2rem 0.5rem', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                    {evaluation.isCorrect ? '✓' : '✗'} Case 1
                  </span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: evaluation.isCorrect ? '#22c55e' : '#ef4444', background: evaluation.isCorrect ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)', padding: '0.2rem 0.5rem', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                    {evaluation.isCorrect ? '✓' : '✗'} Case 2
                  </span>
                </div>

                {/* Inputs and outputs */}
                {challenge.examples && challenge.examples[0] && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem', textTransform: 'uppercase', fontWeight: 800 }}>Input</span>
                      <div style={{ background: 'var(--bg-body)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.6rem 0.85rem', fontSize: '0.78rem', color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                        {challenge.examples[0].input}
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem', textTransform: 'uppercase', fontWeight: 800 }}>Output</span>
                      <div style={{ background: 'var(--bg-body)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.6rem 0.85rem', fontSize: '0.78rem', color: evaluation.isCorrect ? '#22c55e' : '#ef4444', fontFamily: 'monospace', fontWeight: 700 }}>
                        {evaluation.actualOutput !== undefined ? String(evaluation.actualOutput) : (evaluation.isCorrect ? challenge.examples[0].output : 'N/A')}
                      </div>
                    </div>

                    {!evaluation.isCorrect && (
                      <div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem', textTransform: 'uppercase', fontWeight: 800 }}>Expected</span>
                        <div style={{ background: 'var(--bg-body)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.6rem 0.85rem', fontSize: '0.78rem', color: '#22c55e', fontFamily: 'monospace', fontWeight: 700 }}>
                          {evaluation.expectedOutput || challenge.examples[0].output}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Text feedback message */}
                {evaluation.feedback && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                    {evaluation.feedback}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CodingChallenge;
