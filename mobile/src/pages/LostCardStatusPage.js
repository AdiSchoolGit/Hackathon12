import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const API_URL = 'http://localhost:4000'; // Change to your backend IP for physical device

export default function LostCardStatusPage() {
    const navigation = useNavigation();
    const [cardId, setCardId] = useState('');
    const [loading, setLoading] = useState(false);
    const [card, setCard] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async() => {
        if (!cardId.trim()) {
            setError('Please enter a card ID');
            return;
        }

        setLoading(true);
        setError(null);
        setCard(null);

        try {
            const response = await fetch(`${API_URL}/api/cards/${cardId}`);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Failed to fetch card status' }));
                if (response.status === 404) {
                    throw new Error(errorData.error || 'Card not found');
                }
                throw new Error(errorData.error || `Server error: ${response.status}`);
            }

            const data = await response.json();
            setCard(data);
        } catch (err) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const getStatusDisplay = (status) => {
        const statusMap = {
            waiting_for_email: { text: 'Waiting for Email Lookup', color: '#f39c12' },
            email_sent: { text: 'Email Sent', color: '#3498db' },
            notified_owner: { text: 'Owner Notified', color: '#3498db' },
            picked_up: { text: 'Taken Out', color: '#27ae60' }
        };
        return statusMap[status] || { text: status, color: '#95a5a6' };
    };

    return ( <
        ScrollView style = { styles.container } >
        <
        View style = { styles.content } >
        <
        Text style = { styles.title } > Check Card Status < /Text> <
        Text style = { styles.description } >
        Enter your card ID to check the status of your lost card. <
        /Text>

        <
        View style = { styles.form } >
        <
        View style = { styles.formGroup } >
        <
        Text style = { styles.label } > Card ID < /Text> <
        TextInput style = { styles.input }
        value = { cardId }
        onChangeText = { setCardId }
        placeholder = "Enter your card ID" /
        >
        <
        /View> <
        TouchableOpacity style = {
            [styles.submitButton, loading && styles.submitButtonDisabled] }
        onPress = { handleSubmit }
        disabled = { loading } >
        {
            loading ? ( <
                ActivityIndicator color = "#fff" / >
            ) : ( <
                Text style = { styles.submitButtonText } > Check Status < /Text>
            )
        } <
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

        {
            card && ( <
                View style = { styles.cardContainer } >
                <
                Text style = { styles.cardTitle } > Card Status < /Text> <
                View style = {
                    [styles.statusBadge, { backgroundColor: getStatusDisplay(card.status).color }] } >
                <
                Text style = { styles.statusText } > { getStatusDisplay(card.status).text } < /Text> <
                /View>

                <
                View style = { styles.detailsContainer } >
                <
                View style = { styles.detailRow } >
                <
                Text style = { styles.detailLabel } > Card ID: < /Text> <
                Text style = { styles.detailValue } > { card.id } < /Text> <
                /View>

                {
                    card.redId && ( <
                        View style = { styles.detailRow } >
                        <
                        Text style = { styles.detailLabel } > RedID: < /Text> <
                        Text style = { styles.detailValue } > { card.redId } < /Text> <
                        /View>
                    )
                }

                {
                    card.fullName && ( <
                        View style = { styles.detailRow } >
                        <
                        Text style = { styles.detailLabel } > Name: < /Text> <
                        Text style = { styles.detailValue } > { card.fullName } < /Text> <
                        /View>
                    )
                }

                {
                    card.locationDescription && ( <
                        View style = { styles.detailRow } >
                        <
                        Text style = { styles.detailLabel } > Found at: < /Text> <
                        Text style = { styles.detailValue } > { card.locationDescription } < /Text> <
                        /View>
                    )
                }

                {
                    card.boxId && ( <
                        View style = { styles.detailRow } >
                        <
                        Text style = { styles.detailLabel } > Box: < /Text> <
                        Text style = { styles.detailValue } > { card.boxId } < /Text> <
                        /View>
                    )
                }

                {
                    card.pickupCode && ( <
                        View style = { styles.detailRow } >
                        <
                        Text style = { styles.detailLabel } > Pickup Code: < /Text> <
                        Text style = {
                            [styles.detailValue, styles.pickupCode] } > { card.pickupCode } < /Text> <
                        /View>
                    )
                }

                {
                    card.finderContact && ( <
                        View style = { styles.detailRow } >
                        <
                        Text style = { styles.detailLabel } > Contact: < /Text> <
                        Text style = { styles.detailValue } > { card.finderContact } < /Text> <
                        /View>
                    )
                }

                <
                View style = { styles.detailRow } >
                <
                Text style = { styles.detailLabel } > Found on: < /Text> <
                Text style = { styles.detailValue } > { new Date(card.createdAt).toLocaleString() } <
                /Text> <
                /View>

                {
                    card.pickedUpAt && ( <
                        View style = { styles.detailRow } >
                        <
                        Text style = { styles.detailLabel } > Taken out on: < /Text> <
                        Text style = { styles.detailValue } > { new Date(card.pickedUpAt).toLocaleString() } <
                        /Text> <
                        /View>
                    )
                } <
                /View>

                {
                    card.status === 'notified_owner' && card.boxId && card.pickupCode && ( <
                        View style = { styles.instructionsContainer } >
                        <
                        Text style = { styles.instructionsTitle } > Pickup Instructions < /Text> <
                        Text style = { styles.instructionsText } >
                        Go to { card.boxId }
                        and enter code < Text style = { styles.bold } > { card.pickupCode } < /Text> <
                        /Text> <
                        /View>
                    )
                }

                {
                    card.status === 'notified_owner' && card.finderContact && ( <
                        View style = { styles.instructionsContainer } >
                        <
                        Text style = { styles.instructionsTitle } > Contact Information < /Text> <
                        Text style = { styles.instructionsText } >
                        Contact this person to arrange pickup: < Text style = { styles.bold } > { card.finderContact } < /Text> <
                        /Text> <
                        /View>
                    )
                } <
                /View>
            )
        }

        <
        View style = { styles.navButtons } >
        <
        TouchableOpacity style = { styles.navButton }
        onPress = {
            () => navigation.navigate('FoundCard') } >
        <
        Text style = { styles.navButtonText } > Report Found Card < /Text> <
        /TouchableOpacity> <
        /View> <
        /View> <
        /ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#C41230',
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
    },
    form: {
        marginBottom: 20,
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
    submitButtonDisabled: {
        opacity: 0.6,
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
    cardContainer: {
        backgroundColor: '#f8f9fa',
        padding: 16,
        borderRadius: 8,
        marginBottom: 20,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    statusBadge: {
        padding: 8,
        borderRadius: 6,
        marginBottom: 16,
        alignItems: 'center',
    },
    statusText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    detailsContainer: {
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 8,
        flexWrap: 'wrap',
    },
    detailLabel: {
        fontWeight: '600',
        color: '#666',
        marginRight: 8,
        minWidth: 100,
    },
    detailValue: {
        color: '#333',
        flex: 1,
    },
    pickupCode: {
        fontWeight: 'bold',
        color: '#C41230',
        fontSize: 18,
    },
    instructionsContainer: {
        backgroundColor: '#e7f3ff',
        padding: 12,
        borderRadius: 6,
        marginTop: 12,
    },
    instructionsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    instructionsText: {
        fontSize: 14,
        color: '#333',
    },
    bold: {
        fontWeight: 'bold',
    },
    navButtons: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 20,
    },
    navButton: {
        flex: 1,
        backgroundColor: '#34495e',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    navButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
});