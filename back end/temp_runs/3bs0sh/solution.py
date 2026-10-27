import sys

def longest_substring(s):
    # Write your code here
    # Return the length of the longest substring without repeating characters
    return 0

if __name__ == '__main__':
    input_data = sys.stdin.read().strip()
    # Handle empty string input case
    s = input_data if input_data else ""
    print(longest_substring(s))
