import { MockedProvider } from '@apollo/client/testing'
import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import { queries } from '@testing-library/dom'
import { render, renderHook, RenderHookOptions, RenderOptions } from '@testing-library/react'
import { DEFAULT_LOCALE } from 'constants/locales'
import { BlockNumberContext } from 'lib/hooks/useBlockNumber'
import catalog from 'locales/en-US'
import { en } from 'make-plural/plurals'
import { PropsWithChildren, ReactElement, ReactNode } from 'react'
import { HelmetProvider } from 'react-helmet-async/lib/index'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import store from 'state'
import { ThemeProvider } from 'theme'
import { TamaguiProvider } from 'theme/tamaguiProvider'
import { UnitagUpdaterContextProvider } from 'uniswap/src/features/unitags/context'

i18n.load({
  [DEFAULT_LOCALE]: catalog.messages,
})
i18n.loadLocaleData({
  [DEFAULT_LOCALE]: { plurals: en },
})
i18n.activate(DEFAULT_LOCALE)
const MockedI18nProvider = ({ children }: any) => <I18nProvider i18n={i18n}>{children}</I18nProvider>

const queryClient = new QueryClient()

const BLOCK_NUMBER_CONTEXT = { fastForward: () => {}, block: 1234, mainnetBlock: 1234 }
function MockedBlockNumberProvider({ children }: PropsWithChildren) {
  return <BlockNumberContext.Provider value={BLOCK_NUMBER_CONTEXT}>{children}</BlockNumberContext.Provider>
}

const WithProviders = ({ children }: { children?: ReactNode }) => {
  return (
    <HelmetProvider>
      <MockedI18nProvider>
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <BrowserRouter>
              {/*
               * Web3Provider is mocked through setupTests.ts
               * To test behavior that depends on Web3Provider, use jest.unmock('@web3-react/core')
               */}
              <MockedProvider showWarnings={false}>
                <MockedBlockNumberProvider>
                  <UnitagUpdaterContextProvider>
                    <ThemeProvider>
                      <TamaguiProvider>{children}</TamaguiProvider>
                    </ThemeProvider>
                  </UnitagUpdaterContextProvider>
                </MockedBlockNumberProvider>
              </MockedProvider>
            </BrowserRouter>
          </QueryClientProvider>
        </Provider>
      </MockedI18nProvider>
    </HelmetProvider>
  )
}

type CustomRenderOptions = Omit<RenderOptions, 'wrapper'>
const customRender = (ui: ReactElement, options?: CustomRenderOptions) => {
  return render<typeof queries>(ui, { ...options, wrapper: WithProviders })
}

type CustomRenderHookOptions<Props> = Omit<RenderHookOptions<Props>, 'wrapper'>
const customRenderHook = <Result, Props>(
  hook: (initialProps: Props) => Result,
  options?: CustomRenderHookOptions<Props>
) => {
  return renderHook(hook, { ...options, wrapper: WithProviders })
}

// Testing utils may export *.
// eslint-disable-next-line no-restricted-syntax
export * from '@testing-library/react'
export { customRender as render, customRenderHook as renderHook }
