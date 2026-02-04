// use wasm_bindgen::prelude::*;

// #[wasm_bindgen]
// pub fn find_first(haystack: &[u8], needle: &[u8]) -> i32 {
//     if needle.is_empty() || haystack.len() < needle.len() {
//         return -1;
//     }

//     match naive_search_first(haystack, needle) {
//         Some(idx) => idx as i32,
//         None => -1,
//     }
// }

// #[wasm_bindgen]
// pub fn find_all(haystack: &[u8], needle: &[u8], max_results: u32) -> Vec<u32> {
//     let mut results = Vec::new();
//     if needle.is_empty() || haystack.len() < needle.len() || max_results == 0 {
//         return results;
//     }

//     let mut pos = 0;
//     while pos + needle.len() <= haystack.len() && (results.len() as u32) < max_results {
//         match naive_search_first(&haystack[pos..], needle) {
//             Some(idx) => {
//                 let global = (pos + idx) as u32;
//                 results.push(global);
//                 pos = pos + idx + 1;
//             }
//             None => break,
//         }
//     }

//     results
// }

// fn naive_search_first(haystack: &[u8], needle: &[u8]) -> Option<usize> {
//     let n = haystack.len();
//     let m = needle.len();
//     if m == 0 || n < m {
//         return None;
//     }
//     for i in 0..=n - m {
//         let mut j = 0;
//         while j < m && haystack[i + j] == needle[j] {
//             j += 1;
//         }
//         if j == m {
//             return Some(i);
//         }
//     }
//     None
// }

// two way
use wasm_bindgen::prelude::*;

/// find first occurrence of `needle` inside `haystack`.
/// Returns -1 when not found or when needle is empty or longer than haystack,
/// keeping the same behavior before.
#[wasm_bindgen]
pub fn find_first(haystack: &[u8], needle: &[u8]) -> i32 {
    if needle.is_empty() || haystack.len() < needle.len() {
        return -1;
    }

    match twoway::find_bytes(haystack, needle) {
        Some(idx) => idx as i32,
        None => -1,
    }
}

/// find up to `max_results` occurrences (returns indices as u32)
/// Preserves your previous "advance by one after a match" behavior.
#[wasm_bindgen]
pub fn find_all(haystack: &[u8], needle: &[u8], max_results: u32) -> Vec<u32> {
    let mut results = Vec::new();
    if needle.is_empty() || haystack.len() < needle.len() || max_results == 0 {
        return results;
    }

    let mut pos = 0usize;
    let m = needle.len();

    while pos + m <= haystack.len() && (results.len() as u32) < max_results {
        match twoway::find_bytes(&haystack[pos..], needle) {
            Some(idx) => {
                let global = (pos + idx) as u32;
                results.push(global);
                // advance by 1 after a found occurrence (same semantics as before)
                pos = pos + idx + 1;
            }
            None => break,
        }
    }

    results
}
