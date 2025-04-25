package main

import "sync"

var (
	apiKeys     = make(map[string]*ApiKeyInfo)
	apiKeysLock = sync.RWMutex{}
)

func getKeyFromApiKeyCache(apiKey string) (*ApiKeyInfo, bool) {
	apiKeysLock.RLock()
	keyInfo, exists := apiKeys[apiKey]
	apiKeysLock.RUnlock()
	return keyInfo, exists
}

func saveKeyToApiKeyCache(keyInfo *ApiKeyInfo, apiKey string) {
	apiKeysLock.Lock()
	apiKeys[apiKey] = keyInfo
	apiKeysLock.Unlock()
}