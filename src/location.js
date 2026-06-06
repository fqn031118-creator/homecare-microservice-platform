export function formatCoordinate(value) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "--";
  }

  return value.toFixed(6);
}

function buildReadableLocationLabel(referenceLabel = "") {
  const value = referenceLabel.trim();

  if (!value || value.includes("请补充") || value.includes("已获取当前位置") || value.includes("已定位到")) {
    return "";
  }

  const simplified = value
    .replace(/\s*[0-9０-９].*$/, "")
    .replace(/(号|室|栋|单元|楼|层).*$/, "")
    .trim();

  return simplified ? `${simplified}附近` : "";
}

export function formatLocationSummary(location, referenceLabel = "") {
  if (!location) {
    return "未获取定位";
  }

  const readableLabel = buildReadableLocationLabel(referenceLabel);

  return readableLabel ? `已锁定 ${readableLabel}` : "已锁定当前位置";
}

export function formatLocationMeta(location) {
  if (!location) {
    return "";
  }

  return typeof location.accuracy === "number" && location.accuracy > 0 ? `定位精度约 ${Math.round(location.accuracy)} 米` : "已获取精确定位";
}

export function formatLocationTime(location) {
  if (!location?.locatedAt) {
    return "";
  }

  return new Date(location.locatedAt).toLocaleString("zh-CN", { hour12: false }).replace(/\//g, "-");
}

export function buildMapUrl(location, label = "上门位置") {
  if (!location) {
    return "#";
  }

  const lng = formatCoordinate(location.longitude);
  const lat = formatCoordinate(location.latitude);
  return `https://uri.amap.com/marker?position=${lng},${lat}&name=${encodeURIComponent(label)}&src=homecare&callnative=0`;
}
