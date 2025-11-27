use aws_config::BehaviorVersion;
use aws_sdk_cloudwatchlogs::Client;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
struct LogEvent {
    timestamp: i64,
    message: String,
    ingestion_time: i64,
}

#[derive(Debug, Serialize, Deserialize)]
struct FetchLogsRequest {
    region: String,
    log_group: String,
    start_time: i64,
    end_time: i64,
    filter_pattern: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct FetchLogsResponse {
    events: Vec<LogEvent>,
    next_token: Option<String>,
    error: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct LogStream {
    name: String,
    creation_time: i64,
    first_event_time: Option<i64>,
    last_event_time: Option<i64>,
    last_ingestion_time: Option<i64>,
}

#[derive(Debug, Serialize, Deserialize)]
struct DescribeStreamsRequest {
    region: String,
    log_group: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct DescribeStreamsResponse {
    streams: Vec<LogStream>,
    error: Option<String>,
}

#[tauri::command]
async fn fetch_logs(request: FetchLogsRequest) -> Result<FetchLogsResponse, String> {
    println!("========================================");
    println!("Fetching logs with parameters:");
    println!("  Region: {}", request.region);
    println!("  Log Group: {}", request.log_group);
    println!("  Start Time: {} ({})", request.start_time, chrono::DateTime::<chrono::Utc>::from_timestamp_millis(request.start_time).unwrap_or_default());
    println!("  End Time: {} ({})", request.end_time, chrono::DateTime::<chrono::Utc>::from_timestamp_millis(request.end_time).unwrap_or_default());
    println!("  Filter Pattern: {:?}", request.filter_pattern);
    println!("========================================");

    // AWS SDK 설정
    let config = match aws_config::defaults(BehaviorVersion::latest())
        .region(aws_config::Region::new(request.region.clone()))
        .load()
        .await
    {
        config => {
            println!("AWS config loaded successfully");
            config
        }
    };

    let client = Client::new(&config);
    println!("CloudWatch Logs client created");

    // FilterLogEvents API 호출
    let mut req = client
        .filter_log_events()
        .log_group_name(&request.log_group)
        .start_time(request.start_time)
        .end_time(request.end_time);

    // 필터 패턴이 있으면 추가
    let has_filter = if let Some(pattern) = &request.filter_pattern {
        if !pattern.is_empty() {
            println!("Adding filter pattern: '{}'", pattern);
            println!("Filter pattern length: {} bytes", pattern.len());
            req = req.filter_pattern(pattern);
            true
        } else {
            println!("Filter pattern is empty, not applying filter");
            false
        }
    } else {
        println!("No filter pattern specified");
        false
    };

    println!("Sending FilterLogEvents request...");

    match req.send().await {
        Ok(output) => {
            let events: Vec<LogEvent> = output
                .events()
                .iter()
                .map(|e| LogEvent {
                    timestamp: e.timestamp().unwrap_or(0),
                    message: e.message().unwrap_or("").to_string(),
                    ingestion_time: e.ingestion_time().unwrap_or(0),
                })
                .collect();

            println!("✅ Successfully fetched {} log events", events.len());
            println!("Next token present: {}", output.next_token().is_some());
            println!("Searched log streams: {}", output.searched_log_streams().len());

            if events.is_empty() {
                println!("⚠️  No events found. This could mean:");
                println!("   - No logs exist in the specified time range");
                println!("   - The log group name is incorrect");
                if has_filter {
                    println!("   - The filter pattern doesn't match any logs");
                    println!("   TIP: Try removing the filter pattern to see if any logs exist");
                }
                println!("   - AWS credentials don't have access to this log group");

                // 검색된 로그 스트림 정보 출력
                for stream in output.searched_log_streams() {
                    println!("   Searched stream: {} (searched: {})",
                        stream.log_stream_name().unwrap_or("unknown"),
                        stream.searched_completely().unwrap_or(false)
                    );
                }
            } else {
                println!("First event timestamp: {}", events[0].timestamp);
                println!("Last event timestamp: {}", events.last().unwrap().timestamp);
                println!("First event preview: {}",
                    events[0].message.chars().take(100).collect::<String>());
            }

            Ok(FetchLogsResponse {
                events,
                next_token: output.next_token().map(|s| s.to_string()),
                error: None,
            })
        }
        Err(e) => {
            let error_msg = format!("❌ Failed to fetch logs: {}", e);
            println!("{}", error_msg);
            println!("Error details: {:?}", e);
            Err(error_msg)
        }
    }
}

#[tauri::command]
async fn describe_log_streams(request: DescribeStreamsRequest) -> Result<DescribeStreamsResponse, String> {
    println!("========================================");
    println!("Describing log streams:");
    println!("  Region: {}", request.region);
    println!("  Log Group: {}", request.log_group);
    println!("========================================");

    let config = aws_config::defaults(BehaviorVersion::latest())
        .region(aws_config::Region::new(request.region.clone()))
        .load()
        .await;

    let client = Client::new(&config);

    match client
        .describe_log_streams()
        .log_group_name(&request.log_group)
        .order_by(aws_sdk_cloudwatchlogs::types::OrderBy::LastEventTime)
        .descending(true)
        .limit(20)
        .send()
        .await
    {
        Ok(output) => {
            let streams: Vec<LogStream> = output
                .log_streams()
                .iter()
                .map(|s| LogStream {
                    name: s.log_stream_name().unwrap_or("").to_string(),
                    creation_time: s.creation_time().unwrap_or(0),
                    first_event_time: s.first_event_timestamp(),
                    last_event_time: s.last_event_timestamp(),
                    last_ingestion_time: s.last_ingestion_time(),
                })
                .collect();

            println!("✅ Found {} log streams", streams.len());

            for stream in &streams {
                println!("  Stream: {}", stream.name);
                if let Some(last_event) = stream.last_event_time {
                    println!("    Last event: {}",
                        chrono::DateTime::<chrono::Utc>::from_timestamp_millis(last_event).unwrap_or_default());
                }
            }

            Ok(DescribeStreamsResponse {
                streams,
                error: None,
            })
        }
        Err(e) => {
            let error_msg = format!("❌ Failed to describe log streams: {}", e);
            println!("{}", error_msg);
            Err(error_msg)
        }
    }
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, fetch_logs, describe_log_streams])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
