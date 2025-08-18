import env from '#start/env'
import { exec as execCb } from 'node:child_process'
import { promisify } from 'node:util'
import { mkdir, rm, access } from 'node:fs/promises'
import { constants as fsConstants } from 'node:fs'

const exec = promisify(execCb)

function getWorkspaceRoot(): string {
  const configured = env.get('WORKSPACE_DIR') as string | undefined
  return configured && configured.trim().length > 0 ? configured : './app'
}

export async function ensureWorkspace(): Promise<string> {
  const root = getWorkspaceRoot()
  try {
    await access(root, fsConstants.F_OK)
  } catch {
    await mkdir(root, { recursive: true })
  }
  return root
}

export async function cloneOrUpdateRepo(params: {
  repoFullName: string
  branch?: string
  targetDirName: string
  githubToken?: string
}): Promise<{ path: string }> {
  const root = await ensureWorkspace()
  const targetPath = `${root}/${params.targetDirName}`
  const repoUrl = params.githubToken
    ? `https://${params.githubToken}:x-oauth-basic@github.com/${params.repoFullName}.git`
    : `https://github.com/${params.repoFullName}.git`

  // Clean puis clone (MVP simple). On pourra optimiser en fetch/pull plus tard.
  try {
    await rm(targetPath, { recursive: true, force: true })
  } catch {}

  await mkdir(targetPath, { recursive: true })
  const branchArg = params.branch ? `-b ${params.branch}` : ''
  await exec(`git clone --depth 1 ${branchArg} ${repoUrl} ${targetPath}`)
  return { path: targetPath }
}

export async function removeProjectWorkspace(projectId: number): Promise<void> {
  const root = await ensureWorkspace()
  const targetPath = `${root}/project_${projectId}`
  try {
    await rm(targetPath, { recursive: true, force: true })
  } catch {
    // noop
  }
}
