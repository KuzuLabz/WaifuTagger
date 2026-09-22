use read_my_vram::{OsVramProvider, VramProvider};
use std::{fs, path::Path};
use sysinfo::{Disks, Pid, ProcessRefreshKind, ProcessesToUpdate, System};

#[derive(serde::Serialize)]
pub struct MemoryInfo {
    total_ram: u64,
    used_ram: u64,
    free_ram: u64,
}

#[derive(serde::Serialize)]
pub struct StorageInfo {
    total: u64,
    used: u64,
    free: u64,
}

#[derive(serde::Serialize)]
pub struct ProcessMemoryInfo {
    memory_bytes: u64, // Resident Set Size (RSS) - actual physical RAM used
}

pub fn get_dir_bytes<P: AsRef<Path>>(path: P) -> std::io::Result<u64> {
    let mut total_size = 0;

    if path.as_ref().is_dir() {
        for entry in fs::read_dir(path)? {
            let entry = entry?;
            let metadata = entry.metadata()?;

            if metadata.is_dir() {
                // Recursively calculate subdirectories
                total_size += get_dir_bytes(entry.path())?;
            } else {
                total_size += metadata.len();
            }
        }
    }

    Ok(total_size)
}

#[tauri::command]
pub fn get_dir_size(path: String) -> Result<u64, String> {
    get_dir_bytes(&path).map_err(|e| format!("Failed to read directory: {}", e))
}

#[tauri::command]
pub fn get_storage(path: String) -> Result<StorageInfo, String> {
    let target_path = Path::new(&path);

    // Refresh system disk information
    let disks = Disks::new_with_refreshed_list();

    // Find the disk mount point that best matches (longest prefix) the requested path
    let mut best_match = None;
    let mut max_prefix_len = 0;

    for disk in disks.list() {
        let mount_point = disk.mount_point();
        if target_path.starts_with(mount_point) {
            let len = mount_point.as_os_str().len();
            if len >= max_prefix_len {
                max_prefix_len = len;
                best_match = Some(disk);
            }
        }
    }

    if let Some(disk) = best_match {
        let total_bytes = disk.total_space();
        let available_bytes = disk.available_space();
        let used_bytes = total_bytes.saturating_sub(available_bytes);

        Ok(StorageInfo {
            free: available_bytes,
            total: total_bytes,
            used: used_bytes,
        })
    } else {
        Err(format!("No disk mount point found matching path: {}", path))
    }
}

#[tauri::command]
pub fn get_vram_memory() -> Option<MemoryInfo> {
    let provider = OsVramProvider;
    let system = provider.get_system_vram().ok();

    if let Some(vram) = system {
        Some(MemoryInfo {
            total_ram: vram.total_system_mb,
            used_ram: vram.total_used_mb,
            free_ram: vram.total_free_mb,
        })
    } else {
        None
    }
}

#[tauri::command]
pub fn get_app_memory() -> Option<ProcessMemoryInfo> {
    let mut sys = System::new();
    let pid = Pid::from_u32(std::process::id());

    // Start with 'nothing()' and enable ONLY memory tracking
    let refresh_kind = ProcessRefreshKind::nothing().with_memory();

    sys.refresh_processes_specifics(ProcessesToUpdate::Some(&[pid]), true, refresh_kind);

    if let Some(process) = sys.process(pid) {
        Some(ProcessMemoryInfo {
            memory_bytes: process.memory(),
            // virtual_memory_bytes: process.virtual_memory(),
        })
    } else {
        None
    }
}

#[tauri::command]
pub fn get_memory_info() -> MemoryInfo {
    let mut sys = System::new_all();
    // Refresh memory metrics to get real-time values
    sys.refresh_memory();

    MemoryInfo {
        total_ram: sys.total_memory(), // in bytes
        used_ram: sys.used_memory(),   // in bytes
        free_ram: sys.free_memory(),   // in bytes
    }
}
