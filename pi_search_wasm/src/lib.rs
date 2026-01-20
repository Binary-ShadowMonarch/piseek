use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn find_first(haystack: &[u8], needle: &[u8]) -> i32 {
    if needle.is_empty() || haystack.len() < needle.len() {
        return -1;
    }

    match naive_search_first(haystack, needle) {
        Some(idx) => idx as i32,
        None => -1,
    }
}

#[wasm_bindgen]
pub fn find_all(haystack: &[u8], needle: &[u8], max_results: u32) -> Vec<u32> {
    let mut results = Vec::new();
    if needle.is_empty() || haystack.len() < needle.len() || max_results == 0 {
        return results;
    }

    let mut pos = 0;
    while pos + needle.len() <= haystack.len() && (results.len() as u32) < max_results {
        match naive_search_first(&haystack[pos..], needle) {
            Some(idx) => {
                let global = (pos + idx) as u32;
                results.push(global);
                pos = pos + idx + 1;
            }
            None => break,
        }
    }

    results
}

fn naive_search_first(haystack: &[u8], needle: &[u8]) -> Option<usize> {
    let n = haystack.len();
    let m = needle.len();
    if m == 0 || n < m {
        return None;
    }
    for i in 0..=n - m {
        let mut j = 0;
        while j < m && haystack[i + j] == needle[j] {
            j += 1;
        }
        if j == m {
            return Some(i);
        }
    }
    None
}


