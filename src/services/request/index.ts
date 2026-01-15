// 封装 axios
import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 类型定义
interface RequestInterceptors<T = AxiosResponse> {
  requestInterceptor?: (config: AxiosRequestConfig) => AxiosRequestConfig
  requestInterceptorCatch?: (error: unknown) => unknown
  responseInterceptor?: (response: T) => T
  responseInterceptorCatch?: (error: unknown) => unknown
}

interface RequestConfig<T = AxiosResponse> extends AxiosRequestConfig {
  interceptors?: RequestInterceptors<T>
  cache?: boolean
  cacheKey?: string
  debounce?: number
}

// 工具类
class RequestUtils {
  // 生成缓存键
  static generateCacheKey(config: RequestConfig): string {
    const { url, method, params, data } = config
    return `${method || 'GET'}:${url || ''}:${JSON.stringify(params || {})}:${JSON.stringify(data || {})}`
  }
}

// 缓存管理
class CacheManager {
  private static cache = new Map<string, unknown>()

  static get<T>(key: string): T | undefined {
    return this.cache.get(key) as T
  }

  static set<T>(key: string, value: T): void {
    this.cache.set(key, value)
  }

  static has(key: string): boolean {
    return this.cache.has(key)
  }

  static delete(key: string): void {
    this.cache.delete(key)
  }

  static clear(): void {
    this.cache.clear()
  }
}

// 防抖管理
class DebounceManager {
  private static timers = new Map<string, NodeJS.Timeout>()

  static set(key: string, timer: NodeJS.Timeout): void {
    this.clear(key)
    this.timers.set(key, timer)
  }

  static clear(key: string): void {
    const timer = this.timers.get(key)
    if (timer) {
      clearTimeout(timer)
      this.timers.delete(key)
    }
  }

  static clearAll(): void {
    this.timers.forEach(timer => clearTimeout(timer))
    this.timers.clear()
  }
}

// 主请求类
class Request {
  private instance: AxiosInstance

  constructor(config: RequestConfig) {
    this.instance = axios.create(config)
    this.setupInterceptors()
  }

  // 设置拦截器
  private setupInterceptors(): void {
    // 全局请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        NProgress.start()
        return config
      },
      (error) => {
        NProgress.done()
        return Promise.reject(error)
      }
    )

    // 全局响应拦截器
    this.instance.interceptors.response.use(
      (response) => {
        NProgress.done()
        return response.data
      },
      (error) => {
        NProgress.done()
        return Promise.reject(error)
      }
    )
  }

  // 发送请求
  request<T = AxiosResponse>(config: RequestConfig<T>): Promise<T> {
    const cacheKey = config.cacheKey || RequestUtils.generateCacheKey(config)

    // 检查缓存
    if (config.cache && CacheManager.has(cacheKey)) {
      const cachedValue = CacheManager.get<T>(cacheKey)
      if (cachedValue !== undefined) {
        return Promise.resolve(cachedValue)
      }
    }

    // 检查防抖
    if (config.debounce) {
      return new Promise<T>((resolve, reject) => {
        DebounceManager.set(cacheKey, setTimeout(() => {
          this.sendRequest(config, cacheKey).then(resolve).catch(reject)
        }, config.debounce))
      })
    }

    // 正常发送请求
    return this.sendRequest(config, cacheKey)
  }

  // 实际发送请求的方法
  private sendRequest<T = AxiosResponse>(config: RequestConfig<T>, cacheKey: string): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      // 应用请求拦截器
      let processedConfig = config
      if (config.interceptors?.requestInterceptor) {
        try {
          processedConfig = config.interceptors.requestInterceptor(processedConfig)
        } catch (error) {
          if (config.interceptors?.requestInterceptorCatch) {
            config.interceptors.requestInterceptorCatch(error)
          }
          return reject(error)
        }
      }

      this.instance
        .request<unknown, T>(processedConfig)
        .then((response) => {
          // 应用响应拦截器
          let processedResponse = response
          if (config.interceptors?.responseInterceptor) {
            try {
              processedResponse = config.interceptors.responseInterceptor(processedResponse)
            } catch (error) {
              if (config.interceptors?.responseInterceptorCatch) {
                config.interceptors.responseInterceptorCatch(error)
              }
              return reject(error)
            }
          }

          // 缓存结果
          if (config.cache) {
            CacheManager.set(cacheKey, processedResponse)
          }

          resolve(processedResponse)
        })
        .catch((error) => {
          // 应用响应错误拦截器
          if (config.interceptors?.responseInterceptorCatch) {
            try {
              const processedError = config.interceptors.responseInterceptorCatch(error)
              reject(processedError)
            } catch (interceptorError) {
              reject(interceptorError)
            }
          } else {
            reject(error)
          }
        })
    })
  }

  // 快捷方法
  get<T = AxiosResponse>(config: RequestConfig<T>): Promise<T> {
    return this.request<T>({ ...config, method: 'GET' })
  }

  post<T = AxiosResponse>(config: RequestConfig<T>): Promise<T> {
    return this.request<T>({ ...config, method: 'POST' })
  }

  put<T = AxiosResponse>(config: RequestConfig<T>): Promise<T> {
    return this.request<T>({ ...config, method: 'PUT' })
  }

  delete<T = AxiosResponse>(config: RequestConfig<T>): Promise<T> {
    return this.request<T>({ ...config, method: 'DELETE' })
  }

  patch<T = AxiosResponse>(config: RequestConfig<T>): Promise<T> {
    return this.request<T>({ ...config, method: 'PATCH' })
  }

  // 缓存管理方法
  clearCache(key?: string): void {
    if (key) {
      CacheManager.delete(key)
    } else {
      CacheManager.clear()
    }
  }

  // 防抖管理方法
  clearDebounce(key: string): void {
    DebounceManager.clear(key)
  }

  clearAllDebounce(): void {
    DebounceManager.clearAll()
  }
}

export default Request

// 导出默认实例
const defaultRequest = new Request({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 10000
})

export { defaultRequest }
