import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const API_URL = 'http://localhost:4000'; // Change to your backend IP for physical device

export default function AdminPage() {
    const navigation = useNavigation();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editingCardId, setEditingCardId] = useState(null);
    const [emailInput, setEmailInput] = useState('');
    const [sendingEmail, setSendingEmail] = useState(null);

    const handleLogin = () => {
        if (password === 'sdsu_staff_2024') {
            setIsAuthenticated(true);
            setLoginError('');
            setPassword('');
            fetchCards();
        } else {
            setLoginError('Invalid password. Please try again.');
            setPassword('');
        }
    };

    const fetchCards = async() => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/cards?status=waiting_for_email`);

            if (!response.ok) {
                throw new Error('Failed to fetch cards');
            }

            const data = await response.json();
            setCards(data);
        } catch (err) {
            setError(err.message || 'Failed to load cards');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchCards();
        }
    }, [isAuthenticated]);

    const handleSetEmail = async(cardId) => {
        if (!emailInput.trim() || !emailInput.includes('@')) {
            setError('Please enter a valid email address');
            return;
        }

        try {
            setSendingEmail(cardId);
            setError(null);

            const response = await fetch(`${API_URL}/api/cards/${cardId}/set-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: emailInput.trim() }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Failed to set email' }));
                throw new Error(errorData.error || `Server error: ${response.status}`);
            }

            const data = await response.json();

            await fetchCards();

            setEditingCardId(null);
            setEmailInput('');

            Alert.alert('Success', `Email sent successfully to ${data.card.email}!`);
        } catch (err) {
            setError(err.message || 'Failed to set email and send notification');
        } finally {
            setSendingEmail(null);
        }
    };

    const getStatusDisplay = (status) => {
        const statusMap = {
            waiting_for_email: { text: 'Waiting for Email', color: '#f39c12' },
            email_sent: { text: 'Email Sent', color: '#3498db' },
            picked_up: { text: 'Taken Out', color: '#27ae60' }
        };
        return statusMap[status] || { text: status, color: '#95a5a6' };
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    if (!isAuthenticated) {
        return ( <
            ScrollView style = { styles.container } >
            <
            View style = { styles.loginContainer } >
            <
            Text style = { styles.loginTitle } > Staff Login < /Text> <
            Text style = { styles.loginDescription } >
            Enter staff password to access the admin panel. <
            /Text> <
            View style = { styles.loginForm } >
            <
            View style = { styles.formGroup } >
            <
            Text style = { styles.label } > Password < /Text> <
            TextInput style = { styles.input }
            value = { password }
            onChangeText = { setPassword }
            placeholder = "Enter staff password"
            secureTextEntry autoFocus /
            >
            <
            /View> {
                loginError && ( <
                    View style = { styles.errorContainer } >
                    <
                    Text style = { styles.errorText } > { loginError } < /Text> <
                    /View>
                )
            } <
            TouchableOpacity style = { styles.submitButton }
            onPress = { handleLogin } >
            <
            Text style = { styles.submitButtonText } > Login < /Text> <
            /TouchableOpacity> <
            /View> <
            /View> <
            /ScrollView>
        );
    }

    return ( <
        ScrollView style = { styles.container } >
        <
        View style = { styles.content } >
        <
        View style = { styles.header } >
        <
        View >
        <
        Text style = { styles.title } > Admin - Card Management < /Text> <
        Text style = { styles.description } >
        Cards waiting
        for email lookup.Manually look up each student 's email in MySDSU, then enter it here to send the notification. <
        /Text> <
        /View> <
        TouchableOpacity style = { styles.logoutButton }
        onPress = {
            () => setIsAuthenticated(false) } >
        <
        Text style = { styles.logoutButtonText } > Logout < /Text> <
        /TouchableOpacity> <
        /View>

        {
            error && ( <
                View style = { styles.errorContainer } >
                <
                Text style = { styles.errorText } > { error } < /Text> <
                /View>
            )
        }

        <
        View style = { styles.actions } >
        <
        TouchableOpacity style = { styles.refreshButton }
        onPress = { fetchCards }
        disabled = { loading } >
        <
        Text style = { styles.refreshButtonText } > { loading ? 'Loading...' : '🔄 Refresh List' } <
        /Text> <
        /TouchableOpacity> <
        /View>

        {
            loading && cards.length === 0 ? ( <
                View style = { styles.loadingContainer } >
                <
                ActivityIndicator size = "large"
                color = "#C41230" / >
                <
                Text style = { styles.loadingText } > Loading cards... < /Text> <
                /View>
            ) : cards.length === 0 ? ( <
                View style = { styles.emptyState } >
                <
                Text style = { styles.emptyStateText } > ✅No cards waiting
                for email lookup.All caught up! < /Text> <
                /View>
            ) : ( <
                View style = { styles.cardsList } > {
                    cards.map((card) => {
                        const statusDisplay = getStatusDisplay(card.status);
                        const isEditing = editingCardId === card.id;

                        return ( <
                            View key = { card.id }
                            style = { styles.cardItem } >
                            <
                            View style = { styles.cardHeader } >
                            <
                            Text style = { styles.cardIdSmall } > ID: { card.id.substring(0, 8).toUpperCase() } < /Text> <
                            View style = {
                                [styles.statusBadge, { backgroundColor: statusDisplay.color }] } >
                            <
                            Text style = { styles.statusText } > { statusDisplay.text } < /Text> <
                            /View> <
                            /View>

                            <
                            View style = { styles.cardDetails } > {
                                card.redId && ( <
                                    View style = { styles.detailRow } >
                                    <
                                    Text style = { styles.detailLabel } > RedID: < /Text> <
                                    Text style = { styles.detailValue } > { card.redId } < /Text> <
                                    /View>
                                )
                            } {
                                card.fullName && ( <
                                    View style = { styles.detailRow } >
                                    <
                                    Text style = { styles.detailLabel } > Name: < /Text> <
                                    Text style = { styles.detailValue } > { card.fullName } < /Text> <
                                    /View>
                                )
                            } {
                                card.email && ( <
                                    View style = { styles.detailRow } >
                                    <
                                    Text style = { styles.detailLabel } > Email: < /Text> <
                                    Text style = { styles.detailValue } > { card.email } < /Text> <
                                    /View>
                                )
                            } {
                                card.boxId && ( <
                                    View style = { styles.detailRow } >
                                    <
                                    Text style = { styles.detailLabel } > Box: < /Text> <
                                    Text style = { styles.detailValue } > { card.boxId } < /Text> <
                                    /View>
                                )
                            } {
                                card.pickupCode && ( <
                                    View style = { styles.detailRow } >
                                    <
                                    Text style = { styles.detailLabel } > Pickup Code: < /Text> <
                                    Text style = { styles.detailValue } > { card.pickupCode } < /Text> <
                                    /View>
                                )
                            } {
                                card.locationDescription && ( <
                                    View style = { styles.detailRow } >
                                    <
                                    Text style = { styles.detailLabel } > Location: < /Text> <
                                    Text style = { styles.detailValue } > { card.locationDescription } < /Text> <
                                    /View>
                                )
                            } <
                            View style = { styles.detailRow } >
                            <
                            Text style = { styles.detailLabel } > Found: < /Text> <
                            Text style = { styles.detailValue } > { formatDate(card.createdAt) } < /Text> <
                            /View> <
                            /View>

                            {
                                card.status === 'waiting_for_email' && ( <
                                    View style = { styles.cardActions } > {!isEditing ? ( <
                                            TouchableOpacity style = { styles.setEmailButton }
                                            onPress = {
                                                () => {
                                                    setEditingCardId(card.id);
                                                    setEmailInput('');
                                                }
                                            } >
                                            <
                                            Text style = { styles.setEmailButtonText } > Set Email & Send Notification < /Text> <
                                            /TouchableOpacity>
                                        ) : ( <
                                            View style = { styles.emailInputSection } >
                                            <
                                            TextInput style = { styles.emailInput }
                                            value = { emailInput }
                                            onChangeText = { setEmailInput }
                                            placeholder = "Enter student email (from MySDSU)"
                                            keyboardType = "email-address"
                                            autoCapitalize = "none"
                                            editable = { sendingEmail !== card.id }
                                            /> <
                                            View style = { styles.emailActions } >
                                            <
                                            TouchableOpacity style = {
                                                [styles.sendEmailButton, (!emailInput.trim() || sendingEmail === card.id) && styles.buttonDisabled] }
                                            onPress = {
                                                () => handleSetEmail(card.id) }
                                            disabled = { sendingEmail === card.id || !emailInput.trim() } >
                                            {
                                                sendingEmail === card.id ? ( <
                                                    ActivityIndicator color = "#fff" / >
                                                ) : ( <
                                                    Text style = { styles.sendEmailButtonText } > Send Email < /Text>
                                                )
                                            } <
                                            /TouchableOpacity> <
                                            TouchableOpacity style = { styles.cancelButton }
                                            onPress = {
                                                () => {
                                                    setEditingCardId(null);
                                                    setEmailInput('');
                                                }
                                            }
                                            disabled = { sendingEmail === card.id } >
                                            <
                                            Text style = { styles.cancelButtonText } > Cancel < /Text> <
                                            /TouchableOpacity> <
                                            /View> <
                                            Text style = { styles.helpText } >
                                            Look up this student in MySDSU, then paste their email address here. <
                                            /Text> <
                                            /View>
                                        )
                                    } <
                                    /View>
                                )
                            } <
                            /View>
                        );
                    })
                } <
                /View>
            )
        } <
        /View> <
        /ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loginContainer: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        minHeight: 400,
    },
    loginTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#C41230',
        marginBottom: 10,
        textAlign: 'center',
    },
    loginDescription: {
        fontSize: 16,
        color: '#666',
        marginBottom: 30,
        textAlign: 'center',
    },
    loginForm: {
        width: '100%',
    },
    content: {
        padding: 20,
    },
    header: {
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#C41230',
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
    },
    logoutButton: {
        backgroundColor: '#e74c3c',
        padding: 10,
        borderRadius: 6,
        marginTop: 10,
    },
    logoutButtonText: {
        color: '#fff',
        fontWeight: '600',
        textAlign: 'center',
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    submitButton: {
        backgroundColor: '#C41230',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    errorContainer: {
        backgroundColor: '#fee',
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
    },
    errorText: {
        color: '#e74c3c',
        fontSize: 14,
    },
    actions: {
        marginBottom: 20,
    },
    refreshButton: {
        backgroundColor: '#3498db',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    refreshButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    loadingContainer: {
        alignItems: 'center',
        padding: 40,
    },
    loadingText: {
        marginTop: 10,
        color: '#666',
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
    },
    emptyStateText: {
        fontSize: 16,
        color: '#27ae60',
        textAlign: 'center',
    },
    cardsList: {
        gap: 16,
    },
    cardItem: {
        backgroundColor: '#f8f9fa',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardIdSmall: {
        fontSize: 12,
        color: '#666',
        fontFamily: 'monospace',
    },
    statusBadge: {
        padding: 6,
        borderRadius: 4,
        paddingHorizontal: 12,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    cardDetails: {
        marginBottom: 12,
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 6,
        flexWrap: 'wrap',
    },
    detailLabel: {
        fontWeight: '600',
        color: '#666',
        marginRight: 8,
        minWidth: 80,
    },
    detailValue: {
        color: '#333',
        flex: 1,
    },
    cardActions: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    setEmailButton: {
        backgroundColor: '#C41230',
        padding: 12,
        borderRadius: 6,
        alignItems: 'center',
    },
    setEmailButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    emailInputSection: {
        marginTop: 8,
    },
    emailInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        padding: 10,
        fontSize: 14,
        backgroundColor: '#fff',
        marginBottom: 8,
    },
    emailActions: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 8,
    },
    sendEmailButton: {
        flex: 1,
        backgroundColor: '#27ae60',
        padding: 10,
        borderRadius: 6,
        alignItems: 'center',
    },
    sendEmailButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#95a5a6',
        padding: 10,
        borderRadius: 6,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    helpText: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
    },
});