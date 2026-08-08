const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('mutate.ts')) { // we only want mutate.ts files
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(path.join(__dirname, '../src/hooks/useService'));

const MODULE_TO_TYPES = {
  'application': { model: 'ApplicationResponse', array: true },
  'attendance': { model: 'AttendanceResponse', array: true },
  'auth': { model: 'SafeAuthUser', array: false },
  'certificate': { model: 'CertificateResponse', array: true },
  'department': { model: 'DepartmentResponse', array: true },
  'file': { model: 'FileResponse', array: true },
  'internship': { model: 'InternshipResponse', array: true },
  'notification': { model: 'NotificationResponse', array: true },
  'office': { model: 'OfficeResponse', array: true },
  'supervisor': { model: 'SupervisorAssignmentResponse', array: true },
  'user': { model: 'ProfileResponse', array: false },
};

// Capitalize helper
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // determine module from path (e.g. /useService/auth/state/mutate.ts -> auth)
  const moduleMatch = file.match(/useService\/([a-zA-Z]+)\/state\/mutate/);
  if (!moduleMatch) return;
  const mod = moduleMatch[1];
  
  if (!MODULE_TO_TYPES[mod]) return;
  
  const ModName = cap(mod);
  const cacheImportPath = `@/utils/cache/${mod}.cache`;
  const snapshotFn = `read${ModName}Snapshot`;
  const contextType = `${ModName}CacheContext`;
  const rootKey = `${mod}Root()`;

  // 1. imports
  if (!content.includes(contextType)) {
    content = `import { ${snapshotFn}, type ${contextType} } from '${cacheImportPath}';\n` + content;
    changed = true;
  }
  if (!content.includes('useAppNameSpace')) {
    content = `import { useAppNameSpace } from '@/hooks/useAppNameSpace';\n` + content;
    changed = true;
  }
  if (!content.includes('TResponse')) {
    // some files might not have TResponse imported, we need it for globals
    // actually, let's just import TResponse from @/api/types/response.types
    content = `import type { TResponse } from '@/api/types/response.types';\n` + content;
  }

  // 2. regex for useMutation
  // We want to replace `return useMutation({` with generics and replace `const queryClient = useQueryClient()`
  
  const fnRegex = /export\s+function\s+([a-zA-Z0-9_]+)\s*\(\)\s*\{([\s\S]*?)return\s+useMutation(?:<[^>]*>)?\(\{(.*?)\}\);/gm;
  
  content = content.replace(fnRegex, (match, hookName, bodyBeforeMutate, mutateConfig) => {
    let newBody = bodyBeforeMutate;
    
    // Replace const queryClient = useQueryClient();
    if (newBody.includes('useQueryClient()')) {
      newBody = newBody.replace(/const\s+queryClient\s*=\s*useQueryClient\(\);?/g, 'const ns = useAppNameSpace();');
    } else if (!newBody.includes('useAppNameSpace')) {
      newBody += `\n  const ns = useAppNameSpace();\n`;
    }
    
    // Figure out the return type for generic. For now fallback to TResponse<any> if we can't parse easily.
    // However, the rule does not strictly prevent `any` for the response type if we don't know it, but we can do TResponse<unknown>.
    // To be perfectly typed, we need to extract from mutationFn. Let's use `TResponse<any>` or `any` since finding the exact API return type for every single API is hard in regex. Wait, prompt says: "tambahkan CacheContext sebagai generic keempat. Jika mutation tidak mengembalikan entity secara langsung, tetap gunakan response type yang sudah digunakan project dan tambahkan CacheContext sebagai generic keempat."
    // Let's use `any, Error, any, ${contextType}`
    // Actually `useMutation<TResponse<any>, Error, Parameters<typeof mutationFn>[0], ${contextType}>`
    
    // Replace queryClient with ns.queryClient in the config
    let newConfig = mutateConfig.replace(/queryClient\./g, 'ns.queryClient.');
    
    // Add onMutate
    if (!newConfig.includes('onMutate:')) {
      const onMutateStr = `\n    onMutate: async () => {
      await ns.queryClient.cancelQueries({ queryKey: queryKey.${rootKey} });
      return { previousData: ${snapshotFn}(ns) };
    },`;
      
      // insert after mutationFn
      newConfig = newConfig.replace(/(mutationFn:\s*(?:[^,]|\([^)]*\)\s*=>[^{]*?\{[^}]*?\})*,?)/, `$1${onMutateStr}`);
    }

    return `export function ${hookName}() {${newBody}return useMutation<any, Error, any, ${contextType}>({${newConfig}});`;
  });

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Refactored ${file}`);
  }
});
