export function getPackageVersion(packageJson: any, name: string): string {
  if (packageJson.dependencies && packageJson.dependencies[name]) {
    return packageJson.dependencies[name]
  } else if (packageJson.devDependencies && packageJson.devDependencies[name]) {
    return packageJson.devDependencies[name]
  } else {
    return ''
  }
}

export function getBigVersion (version: string) {
  const res = version.match(/\d/)
  if (res) {
    return res[0]
  }
}