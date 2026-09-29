export const normalizeToolPath = (path: string) => path.split('?')[0].replace(/\/+$/, '') || '/'

export const isToolRouteName = (name: string | symbol | null | undefined) =>
  Boolean(name && !['home', 'about', '404', 'Any'].includes(String(name)))

export const toolComponentName = (name: string | symbol) =>
  `ToolTab_${String(name).replace(/[^a-zA-Z0-9_]/g, '_')}`
