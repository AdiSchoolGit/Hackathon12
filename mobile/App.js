import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import FoundCardPage from './src/pages/FoundCardPage';
import LostCardStatusPage from './src/pages/LostCardStatusPage';
import AdminPage from './src/pages/AdminPage';

const Stack = createNativeStackNavigator();

export default function App() {
    return ( <
        NavigationContainer >
        <
        StatusBar style = "auto" / >
        <
        Stack.Navigator initialRouteName = "FoundCard"
        screenOptions = {
            {
                headerStyle: {
                    backgroundColor: '#C41230',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            }
        } >
        <
        Stack.Screen name = "FoundCard"
        component = { FoundCardPage }
        options = {
            { title: 'Clumsy Aztecs' } }
        /> <
        Stack.Screen name = "Status"
        component = { LostCardStatusPage }
        options = {
            { title: 'Check Card Status' } }
        /> <
        Stack.Screen name = "Admin"
        component = { AdminPage }
        options = {
            { title: 'Admin' } }
        /> <
        /Stack.Navigator> <
        /NavigationContainer>
    );
}