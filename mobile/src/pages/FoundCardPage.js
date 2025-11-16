import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Image,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';

const API_URL = 'http://localhost:4000'; // Change to your backend IP for physical device

export default function FoundCardPage() {
    const navigation = useNavigation();
    const [formData, setFormData] = useState({
        cardImage: null,
        finderContact: '',
        locationDescription: '',
        boxId: '',
        manualRedId: ''
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [imageUri, setImageUri] = useState(null);

    const requestCameraPermission = async() => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Camera permission is required to take photos');
            return false;
        }
        return true;
    };

    const takePhoto = async() => {
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) return;

        try {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.9,
            });

            if (!result.canceled && result.assets[0]) {
                setImageUri(result.assets[0].uri);
                setFormData(prev => ({...prev, cardImage: result.assets[0] }));
            }
        } catch (err) {
            setError('Could not take photo. Please try again.');
            console.error('Camera error:', err);
        }
    };

    const pickImage = async() => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.9,
            });

            if (!result.canceled && result.assets[0]) {
                setImageUri(result.assets[0].uri);
                setFormData(prev => ({...prev, cardImage: result.assets[0] }));
            }
        } catch (err) {
            setError('Could not pick image. Please try again.');
            console.error('Image picker error:', err);
        }
    };

    const handleInputChange = (name, value) => {
        setFormData(prev => ({...prev, [name]: value }));
    };

    const handleSubmit = async() => {
        if (!formData.cardImage) {
            setError('Please upload a photo of the card');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const formDataToSend = new FormData();

            // Append image file
            formDataToSend.append('cardImage', {
                    uri: formData.cardImage.uri,
                    type: 'image/jpeg',
                    name: 'card-photo.jpg',
                }
                as any);

            if (formData.finderContact) {
                formDataToSend.append('finderContact', formData.finderContact);
            }
            if (formData.locationDescription) {
                formDataToSend.append('locationDescription', formData.locationDescription);
            }
            if (formData.boxId) {
                formDataToSend.append('boxId', formData.boxId);
            }
            if (formData.manualRedId) {
                formDataToSend.append('manualRedId', formData.manualRedId);
            }

            const response = await fetch(`${API_URL}/api/found-card-photo`, {
                method: 'POST',
                body: formDataToSend,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Failed to submit card' }));
                throw new Error(errorData.error || `Server error: ${response.status}`);
            }

            const data = await response.json();
            setResult(data);

            // Reset form
            setFormData({
                cardImage: null,
                finderContact: '',
                locationDescription: '',
                boxId: '',
                manualRedId: ''
            });
            setImageUri(null);
        } catch (err) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return ( <
        ScrollView style = { styles.container } >
        <
        View style = { styles.content } >
        <
        Text style = { styles.title } > I Found a Card < /Text> <
        Text style = { styles.description } >
        Upload a photo of the student ID card you found.We 'll try to contact the owner. <
        /Text>

        <
        View style = { styles.form } >
        <
        View style = { styles.formGroup } >
        <
        Text style = { styles.label } >
        Card Photo < Text style = { styles.required } > * < /Text> <
        /Text>

        <
        View style = { styles.imageOptions } >
        <
        TouchableOpacity style = { styles.cameraButton }
        onPress = { takePhoto } >
        <
        Text style = { styles.buttonText } > 📷Take Photo < /Text> <
        /TouchableOpacity> <
        TouchableOpacity style = { styles.uploadButton }
        onPress = { pickImage } >
        <
        Text style = { styles.buttonText } > 📁Upload Photo < /Text> <
        /TouchableOpacity> <
        /View>

        {
            imageUri && ( <
                View style = { styles.imagePreviewContainer } >
                <
                Image source = {
                    { uri: imageUri } }
                style = { styles.imagePreview }
                /> <
                TouchableOpacity style = { styles.removeButton }
                onPress = {
                    () => {
                        setImageUri(null);
                        setFormData(prev => ({...prev, cardImage: null }));
                    }
                } >
                <
                Text style = { styles.removeButtonText } > Remove < /Text> <
                /TouchableOpacity> <
                /View>
            )
        } <
        /View>

        <
        View style = { styles.formGroup } >
        <
        Text style = { styles.label } > Where did you find it ? (Optional) < /Text> <
        TextInput style = { styles.input }
        value = { formData.locationDescription }
        onChangeText = {
            (value) => handleInputChange('locationDescription', value) }
        placeholder = "e.g., Love Library, 2nd floor" /
        >
        <
        /View>

        <
        View style = { styles.formGroup } >
        <
        Text style = { styles.label } > How can the owner contact you ? (Optional) < /Text> <
        TextInput style = { styles.input }
        value = { formData.finderContact }
        onChangeText = {
            (value) => handleInputChange('finderContact', value) }
        placeholder = "e.g., email@example.com or phone number" /
        >
        <
        /View>

        <
        View style = { styles.formGroup } >
        <
        Text style = { styles.label } > RedID(Optional - Manual Entry) < /Text> <
        TextInput style = { styles.input }
        value = { formData.manualRedId }
        onChangeText = {
            (value) => handleInputChange('manualRedId', value) }
        placeholder = "Enter 9-digit RedID (e.g., 123456789)"
        keyboardType = "numeric"
        maxLength = { 9 }
        /> <
        Text style = { styles.helpText } >
        If OCR doesn 't detect the RedID automatically, you can enter it manually here. <
        /Text> <
        /View>

        <
        View style = { styles.formGroup } >
        <
        Text style = { styles.label } > Box Location(Optional) < /Text> <
        View style = { styles.pickerContainer } >
        <
        Picker selectedValue = { formData.boxId }
        onValueChange = {
            (value) => handleInputChange('boxId', value) }
        style = { styles.picker } >
        <
        Picker.Item label = "Select a box location..."
        value = "" / >
        <
        Picker.Item label = "Box 1 - Love Library"
        value = "BOX_1" / >
        <
        Picker.Item label = "Box 2 - Student Union"
        value = "BOX_2" / >
        <
        Picker.Item label = "Box 3 - Engineering Building"
        value = "BOX_3" / >
        <
        Picker.Item label = "Box 4 - Main Campus"
        value = "BOX_4" / >
        <
        /Picker> <
        /View> <
        Text style = { styles.helpText } >
        If you 're placing the card in a pickup box, select the box location. <
        /Text> <
        /View>

        <
        TouchableOpacity style = {
            [styles.submitButton, loading && styles.submitButtonDisabled] }
        onPress = { handleSubmit }
        disabled = { loading } >
        {
            loading ? ( <
                ActivityIndicator color = "#fff" / >
            ) : ( <
                Text style = { styles.submitButtonText } > Submit < /Text>
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
            result && ( <
                View style = { styles.successContainer } >
                <
                Text style = { styles.successTitle } > Thank you! < /Text> <
                Text style = { styles.successMessage } > { result.message } < /Text> <
                View style = { styles.referenceInfo } >
                <
                Text style = { styles.referenceText } >
                <
                Text style = { styles.bold } > Reference Code: < /Text> {result.referenceCode} <
                /Text> {
                    result.redId && ( <
                        Text style = { styles.referenceText } >
                        <
                        Text style = { styles.bold } > RedID: < /Text> <Text style={styles.redIdValue}>{result.redId}</Text >
                        <
                        /Text>
                    )
                } {
                    result.boxId && ( <
                        Text style = { styles.referenceText } >
                        <
                        Text style = { styles.bold } > Box Location: < /Text> {result.boxId} <
                        /Text>
                    )
                } {
                    result.pickupCode && ( <
                        Text style = { styles.referenceText } >
                        <
                        Text style = { styles.bold } > Pickup Code: < /Text> {result.pickupCode} <
                        /Text>
                    )
                } <
                /View> <
                /View>
            )
        }

        <
        View style = { styles.navButtons } >
        <
        TouchableOpacity style = { styles.navButton }
        onPress = {
            () => navigation.navigate('Status') } >
        <
        Text style = { styles.navButtonText } > Check Card Status < /Text> <
        /TouchableOpacity> <
        TouchableOpacity style = { styles.navButton }
        onPress = {
            () => navigation.navigate('Admin') } >
        <
        Text style = { styles.navButtonText } > Admin < /Text> <
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
    required: {
        color: '#e74c3c',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        backgroundColor: '#fff',
        overflow: 'hidden',
    },
    picker: {
        height: 50,
    },
    helpText: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    imageOptions: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 10,
    },
    cameraButton: {
        flex: 1,
        backgroundColor: '#C41230',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    uploadButton: {
        flex: 1,
        backgroundColor: '#34495e',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    imagePreviewContainer: {
        marginTop: 10,
        alignItems: 'center',
    },
    imagePreview: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginBottom: 10,
    },
    removeButton: {
        backgroundColor: '#e74c3c',
        padding: 8,
        borderRadius: 6,
        paddingHorizontal: 16,
    },
    removeButtonText: {
        color: '#fff',
        fontWeight: '600',
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
    successContainer: {
        backgroundColor: '#d4edda',
        padding: 16,
        borderRadius: 8,
        marginBottom: 20,
    },
    successTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#155724',
        marginBottom: 8,
    },
    successMessage: {
        fontSize: 16,
        color: '#155724',
        marginBottom: 12,
    },
    referenceInfo: {
        marginTop: 8,
    },
    referenceText: {
        fontSize: 14,
        color: '#155724',
        marginBottom: 4,
    },
    bold: {
        fontWeight: 'bold',
    },
    redIdValue: {
        fontWeight: 'bold',
        color: '#C41230',
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