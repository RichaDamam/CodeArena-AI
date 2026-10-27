const mongoose = require('mongoose');
const Question = require('../models/Question');
require('dotenv').config();

const questions = [
  {
    title: "Two Sum",
    difficulty: "easy",
    topic: "Arrays",
    statement: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nInput format:\n- Line 1: N, the number of elements in the array.\n- Line 2: N space-separated integers.\n- Line 3: The target integer.\n\nOutput format:\n- Print the two indices space-separated (e.g., `0 1`).",
    hints: [
      "Try using a hash map to store the index of each number as you iterate.",
      "Check if (target - current_number) exists in the hash map."
    ],
    videoUrl: "https://www.youtube.com/embed/KLlXCFG5Tk0",
    testCases: [
      { input: "4\n2 7 11 15\n9", output: "0 1", isSample: true },
      { input: "3\n3 2 4\n6", output: "1 2", isSample: true },
      { input: "2\n3 3\n6", output: "0 1", isSample: false }
    ],
    starterTemplates: {
      python: `import sys

def two_sum(nums, target):
    # Write your code here
    # Return list of two indices, e.g. [0, 1]
    pass

if __name__ == '__main__':
    lines = sys.stdin.read().splitlines()
    if len(lines) >= 3:
        n = int(lines[0])
        nums = list(map(int, lines[1].split()))
        target = int(lines[2])
        indices = two_sum(nums, target)
        if indices:
            print(f"{indices[0]} {indices[1]}")
`,
      javascript: `const fs = require('fs');

function twoSum(nums, target) {
    // Write your code here
    // Return array of two indices, e.g. [0, 1]
    return [];
}

const input = fs.readFileSync(0, 'utf-8');
const lines = input.trim().split('\\n');
if (lines.length >= 3) {
    const n = parseInt(lines[0].trim());
    const nums = lines[1].trim().split(' ').map(Number);
    const target = parseInt(lines[2].trim());
    const result = twoSum(nums, target);
    if (result && result.length === 2) {
        console.log(result.join(' '));
    }
}
`,
      java: `import java.util.*;
import java.io.*;

public class Main {
    public static int[] twoSum(int[] nums, int target) {
        // Write your code here
        return new int[2];
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int[] nums = new int[n];
            for (int i = 0; i < n; i++) {
                nums[i] = sc.nextInt();
            }
            int target = sc.nextInt();
            int[] result = twoSum(nums, target);
            System.out.println(result[0] + " " + result[1]);
        }
    }
}
`
    }
  },
  {
    title: "Longest Substring Without Repeating Characters",
    difficulty: "medium",
    topic: "Strings",
    statement: "Given a string `s`, find the length of the longest substring without repeating characters.\n\nInput format:\n- A single line containing the string `s`.\n\nOutput format:\n- A single integer representing the length of the longest substring.",
    hints: [
      "Use a sliding window approach with two pointers (left and right).",
      "Keep track of the last seen index of each character using a map."
    ],
    videoUrl: "https://www.youtube.com/embed/wiGpuckipC0",
    testCases: [
      { input: "abcabcbb", output: "3", isSample: true },
      { input: "bbbbb", output: "1", isSample: true },
      { input: "pwwkew", output: "3", isSample: false }
    ],
    starterTemplates: {
      python: `import sys

def longest_substring(s):
    # Write your code here
    # Return the length of the longest substring without repeating characters
    return 0

if __name__ == '__main__':
    input_data = sys.stdin.read().strip()
    # Handle empty string input case
    s = input_data if input_data else ""
    print(longest_substring(s))
`,
      javascript: `const fs = require('fs');

function longestSubstring(s) {
    // Write your code here
    return 0;
}

const input = fs.readFileSync(0, 'utf-8');
const s = input.replace(/\\r?\\n/g, '');
console.log(longestSubstring(s));
`,
      java: `import java.util.*;
import java.io.*;

public class Main {
    public static int longestSubstring(String s) {
        // Write your code here
        return 0;
    }

    public static void main(String[] args) throws IOException {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        String s = reader.readLine();
        if (s == null) s = "";
        System.out.println(longestSubstring(s));
    }
}
`
    }
  },
  {
    title: "Trapping Rain Water",
    difficulty: "hard",
    topic: "Arrays",
    statement: "Given `n` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.\n\nInput format:\n- Line 1: N, the number of bars.\n- Line 2: N space-separated integers representing heights.\n- If N is 0, height is empty.\n\nOutput format:\n- A single integer representing the amount of trapped water.",
    hints: [
      "Use two pointers: one at the beginning and one at the end.",
      "Track the maximum height seen so far from left and right."
    ],
    videoUrl: "https://www.youtube.com/embed/ZI2z5pq0TqA",
    testCases: [
      { input: "12\n0 1 0 2 1 0 1 3 2 1 2 1", output: "6", isSample: true },
      { input: "6\n4 2 0 3 2 5", output: "9", isSample: true },
      { input: "0\n", output: "0", isSample: false }
    ],
    starterTemplates: {
      python: `import sys

def trap(heights):
    # Write your code here
    # Return the amount of trapped rain water
    return 0

if __name__ == '__main__':
    lines = sys.stdin.read().splitlines()
    if len(lines) >= 2:
        n = int(lines[0])
        heights = list(map(int, lines[1].split()))
        print(trap(heights))
    else:
        print(0)
`,
      javascript: `const fs = require('fs');

function trap(heights) {
    // Write your code here
    return 0;
}

const input = fs.readFileSync(0, 'utf-8');
const lines = input.trim().split('\\n');
if (lines.length >= 2 && lines[0].trim() !== '') {
    const n = parseInt(lines[0].trim());
    const heights = lines[1].trim().split(' ').map(Number);
    console.log(trap(heights));
} else {
    console.log(0);
}
`,
      java: `import java.util.*;
import java.io.*;

public class Main {
    public static int trap(int[] height) {
        // Write your code here
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int[] heights = new int[n];
            for (int i = 0; i < n; i++) {
                heights[i] = sc.nextInt();
            }
            System.out.println(trap(heights));
        } else {
            System.out.println(0);
        }
    }
}
`
    }
  }
];

const seedDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/codearena');
    console.log(`Seed MongoDB Connected: ${conn.connection.host}`);
    
    // Clear existing questions and drop indexes
    try {
      await Question.collection.drop();
      console.log('Dropped questions collection and cleared indexes');
    } catch (e) {
      // Collection might not exist yet, clear documents just in case
      await Question.deleteMany({});
      console.log('Cleared existing questions');
    }
    
    // Insert new questions
    await Question.insertMany(questions);
    console.log('Seeded questions successfully');
    
    mongoose.connection.close();
    console.log('Connection closed');
  } catch (error) {
    console.error(`Seeding error: ${error.message}`);
    process.exit(1);
  }
};

seedDB();
