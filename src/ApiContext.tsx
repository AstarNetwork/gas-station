import '@polkadot/api-augment';
import { ApiPromise, WsProvider } from '@polkadot/api';
import React, { useEffect, useState } from 'react';

export interface ApiContextType {
	astarApi: ApiPromise | undefined;
	astarApiReady: boolean;
	shidenApi: ApiPromise | undefined;
	shidenApiReady: boolean;
	shibuyaApi: ApiPromise | undefined;
	shibuyaApiReady: boolean;
}

export const ApiContext: React.Context<ApiContextType> = React.createContext(
	{} as ApiContextType
);

export interface ApiContextProviderProps {
	children?: React.ReactElement;
}

export function ApiContextProvider(
	props: ApiContextProviderProps
): React.ReactElement {
	const { children = null } = props;
	const [astarApi, setAstarApi] = useState<ApiPromise>();
	const [astarApiReady, setAstarApiReady] = useState(false);
	const [shidenApi, setShidenApi] = useState<ApiPromise>();
	const [shidenApiReady, setShidenApiReady] = useState(false);
	const [shibuyaApi, setShibuyaApi] = useState<ApiPromise>();
	const [shibuyaApiReady, setShibuyaApiReady] = useState(false);

	useEffect(() => {
		const astarProvider = new WsProvider('wss://rpc.astar.network');
		const shidenProvider = new WsProvider('wss://rpc.shiden.astar.network');
		const shibuyaProvider = new WsProvider('wss://rpc.shibuya.astar.network');

		setAstarApiReady(false);
		setShidenApiReady(false);
		setShibuyaApiReady(false);

		setAstarApi(new ApiPromise({ provider: astarProvider }));
		setShidenApi(new ApiPromise({ provider: shidenProvider }));
		setShibuyaApi(new ApiPromise({ provider: shibuyaProvider }));
	}, []);

	useEffect(() => {
		if (astarApi){
			astarApi.isReady.then(() => {
				setAstarApiReady(true);
				console.log('Astar API ready');
			})
				.catch((error) => {
					console.error(error);
				});
		}
	}, [astarApi]);

	useEffect(() => {
		if (shidenApi){
			shidenApi.isReady.then(() => {
				setShidenApiReady(true);
				console.log('Shiden API ready');
			})
				.catch((error) => {
					console.error(error);
				});
		}
	}, [shidenApi]);

	useEffect(() => {
		if (shibuyaApi){
			shibuyaApi.isReady.then(() => {
				setShibuyaApiReady(true);
				console.log('Shibuya API ready');
			})
				.catch((error) => {
					console.error(error);
				});
		}
	}, [shibuyaApi]);

	return (
		<ApiContext.Provider value={{
			astarApi,
			astarApiReady,
			shidenApi,
			shidenApiReady,
			shibuyaApi,
			shibuyaApiReady
		}}>
			{children}
		</ApiContext.Provider>
	);
}
