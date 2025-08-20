use js_sys::Date;
use once_cell::sync::Lazy;
use serde::Serialize;
use std::collections::HashMap;
use wasm_bindgen::prelude::*;

#[derive(Serialize)]
#[serde(tag = "kind")]
enum Action {
    #[serde(rename = "print")]
    Print { text: String },
    #[serde(rename = "clear")]
    Clear,
    #[serde(rename = "open")]
    Open { url: String },
    #[serde(rename = "theme")]
    Theme { value: String },
}

static FILES: Lazy<HashMap<&'static str, &'static str>> = Lazy::new(|| {
    let mut m = HashMap::new();
    m.insert("about.txt", "Hi, I'm Richard.");
    m
});

fn tokenize(input: &str) -> (String, Vec<String>) {
    // Quate対応
    let mut tokens = Vec::new();
    let mut cur = String::new();
    let mut in_s = false; // 今シングルクオーテーションの中にいるか
    let mut in_d = false; // 今ダブルクオーテーションの中にいるか

    for c in input.chars() {
        match c {
            '"' if !in_d => {
                in_d = !in_d;
                continue;
            }
            // エスケープ
            '\'' if !in_s => {
                in_s = !in_s;
                continue;
            }
            // スペースやタブで区切る
            ' ' | '\t' if !in_s && !in_d => {
                if !cur.is_empty() {
                    tokens.push(std::mem::take(&mut cur));
                }
                continue;
            }
            _ => cur.push(c),
        }
    }
    if !cur.is_empty() {
        tokens.push(cur)
    }

    let cmd = tokens.get(0).cloned().unwrap_or_default();
    let args = if tokens.len() > 1 {
        tokens[1..].to_vec()
    } else {
        vec![]
    };
    (cmd, args)
}

fn help_text() -> String {
    [
        "Available commands:",
        "  help           Show this help",
        "  clear          Clear the screen",
        "  echo <text>    Print text",
        "  date           Show local time",
        "  whoami         Print user",
        "  uname          Print system info",
        "  pwd            Print directory",
        "  ls             List demo files",
        "  cat <file>     Show file (about.txt)",
        "  open <url>     Open link in new tab",
        "  theme <name>   matrix | classic | light",
    ]
    .join("\n")
}

#[wasm_bindgen]
pub fn commands() -> JsValue {
    let cmds = [
        "help", "clear", "echo", "date", "whoami", "uname", "pwd", "ls", "cat", "open", "theme",
    ];
    serde_wasm_bindgen::to_value(&cmds).unwrap()
}

#[wasm_bindgen]
pub fn handle_command(input: &str) -> JsValue {
    let line = input.trim();
    if line.is_empty() {
        return serde_wasm_bindgen::to_value(&Vec::<Action>::new()).unwrap();
    }
    let (cmd, args) = tokenize(line);

    let mut out: Vec<Action> = Vec::new();

    match cmd.as_str() {
        "help" => out.push(Action::Print { text: help_text() }),
        "clear" => out.push(Action::Clear),
        "echo" => out.push(Action::Print {
            text: args.join(" "),
        }),
        "date" => out.push(Action::Print {
            text: Date::new_0().to_string().into(),
        }),
        "whoami" => out.push(Action::Print {
            text: "guest".into(),
        }),
        "uname" => out.push(Action::Print {
            text: "portfolio 1.0.0 x86_64 (rust-wasm)".into(),
        }),
        "pwd" => out.push(Action::Print { text: "~/".into() }),
        "ls" => {
            let list = FILES.keys().cloned().collect::<Vec<_>>().join(" ");
            out.push(Action::Print { text: list });
        }
        "cat" => {
            if let Some(name) = args.get(0) {
                if let Some(content) = FILES.get(name.as_str()) {
                    out.push(Action::Print {
                        text: (*content).into(),
                    });
                } else {
                    out.push(Action::Print {
                        text: format!("cat: {}: No such file or directory", name),
                    })
                }
            } else {
                out.push(Action::Print {
                    text: "cat: missing file name".into(),
                });
            }
        }
        "open" => {
            if let Some(raw) = args.get(0) {
                let url = if raw.starts_with("http://") || raw.starts_with("https://") {
                    raw.clone()
                } else {
                    format!("https://{raw}")
                };
                out.push(Action::Open { url });
                out.push(Action::Print {
                    text: format!("Opening..."),
                });
            } else {
                out.push(Action::Print {
                    text: "open: missing url".into(),
                });
            }
        }
        "theme" => {
            let v = args.get(0).map(|s| s.as_str()).unwrap_or("matrix");
            let ok = matches!(v, "matrix" | "classic" | "light");
            if ok {
                out.push(Action::Theme {
                    value: v.to_string(),
                });
                out.push(Action::Print {
                    text: format!("Theme changed to {}", v),
                })
            } else {
                out.push(Action::Print {
                    text: "theme: supported -> matrix | classic | light".into(),
                });
            }
        }
        "" => {}
        other => out.push(Action::Print {
            text: format!("{}: command not found (try help)", other),
        }),
    }
    serde_wasm_bindgen::to_value(&out).unwrap()
}
