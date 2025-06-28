import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import { authenticatedRequest } from '../utils/apiUtils';

const initialForm = {
  propType: '',
  adType: '',
  address: {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  },
  propAmt: '',
  addInfo: {
    bedrooms: '',
    bathrooms: '',
    area: '',
    parking: false,
    furnished: false,
    petsAllowed: false,
    description: '',
    amenities: '' // comma separated
  },
  ownerContact: {
    phone: '',
    email: ''
  }
};

const AddProperty = () => {
  const [form, setForm] = useState(initialForm);
  const [images, setImages] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked, dataset } = e.target;
    if (dataset.group) {
      setForm({
        ...form,
        [dataset.group]: {
          ...form[dataset.group],
          [name]: type === 'checkbox' ? checked : value
        }
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(false);
    setError(null);
    
    // Validate required fields
    if (!form.propType || !form.adType || !form.propAmt) {
      setError('Please fill in all required fields');
      return;
    }

    const formData = new FormData();
    formData.append('propType', form.propType);
    formData.append('adType', form.adType);
    formData.append('address', JSON.stringify(form.address));
    formData.append('propAmt', form.propAmt);
    formData.append('addInfo', JSON.stringify({
      ...form.addInfo,
      bedrooms: Number(form.addInfo.bedrooms) || 0,
      bathrooms: Number(form.addInfo.bathrooms) || 0,
      area: Number(form.addInfo.area) || 0,
      parking: Boolean(form.addInfo.parking),
      furnished: Boolean(form.addInfo.furnished),
      petsAllowed: Boolean(form.addInfo.petsAllowed),
      amenities: form.addInfo.amenities ? form.addInfo.amenities.split(',').map(a => a.trim()).filter(Boolean) : []
    }));
    formData.append('ownerContact', JSON.stringify(form.ownerContact));
    images.forEach((img) => {
      formData.append('images', img);
    });
    
    try {
      await authenticatedRequest({
        method: 'POST',
        url: '/api/properties/',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setSubmitted(true);
      setForm(initialForm);
      setImages([]);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to add property';
      setError(errorMessage);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card>
            <Card.Body>
              <h2 className="text-center mb-4">Add Property</h2>
              {submitted && (
                <Alert variant="success">Property added successfully!</Alert>
              )}
              {error && (
                <Alert variant="danger">{error}</Alert>
              )}
              <Form onSubmit={handleSubmit} encType="multipart/form-data">
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="formPropType">
                      <Form.Label>Property Type</Form.Label>
                      <Form.Select name="propType" value={form.propType} onChange={handleChange} required>
                        <option value="">Select type</option>
                        <option value="apartment">Apartment</option>
                        <option value="house">House</option>
                        <option value="room">Room</option>
                        <option value="studio">Studio</option>
                        <option value="villa">Villa</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="formAdType">
                      <Form.Label>Ad Type</Form.Label>
                      <Form.Select name="adType" value={form.adType} onChange={handleChange} required>
                        <option value="">Select type</option>
                        <option value="rent">Rent</option>
                        <option value="sale">Sale</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                <h5 className="mt-3">Address</h5>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="formStreet">
                      <Form.Label>Street</Form.Label>
                      <Form.Control type="text" name="street" value={form.address.street} onChange={e => setForm({ ...form, address: { ...form.address, street: e.target.value } })} required />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="formCity">
                      <Form.Label>City</Form.Label>
                      <Form.Control type="text" name="city" value={form.address.city} onChange={e => setForm({ ...form, address: { ...form.address, city: e.target.value } })} required />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3" controlId="formState">
                      <Form.Label>State</Form.Label>
                      <Form.Control type="text" name="state" value={form.address.state} onChange={e => setForm({ ...form, address: { ...form.address, state: e.target.value } })} required />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3" controlId="formZipCode">
                      <Form.Label>Zip Code</Form.Label>
                      <Form.Control type="text" name="zipCode" value={form.address.zipCode} onChange={e => setForm({ ...form, address: { ...form.address, zipCode: e.target.value } })} required />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3" controlId="formCountry">
                      <Form.Label>Country</Form.Label>
                      <Form.Control type="text" name="country" value={form.address.country} onChange={e => setForm({ ...form, address: { ...form.address, country: e.target.value } })} required />
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-3" controlId="formPropAmt">
                  <Form.Label>Price</Form.Label>
                  <Form.Control type="number" name="propAmt" value={form.propAmt} onChange={handleChange} required />
                </Form.Group>
                <h5 className="mt-3">Additional Info</h5>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3" controlId="formBedrooms">
                      <Form.Label>Bedrooms</Form.Label>
                      <Form.Control type="number" name="bedrooms" data-group="addInfo" value={form.addInfo.bedrooms} onChange={handleChange} />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3" controlId="formBathrooms">
                      <Form.Label>Bathrooms</Form.Label>
                      <Form.Control type="number" name="bathrooms" data-group="addInfo" value={form.addInfo.bathrooms} onChange={handleChange} />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3" controlId="formArea">
                      <Form.Label>Area (sqft)</Form.Label>
                      <Form.Control type="number" name="area" data-group="addInfo" value={form.addInfo.area} onChange={handleChange} />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3" controlId="formParking">
                      <Form.Check type="checkbox" label="Parking" name="parking" data-group="addInfo" checked={form.addInfo.parking} onChange={handleChange} />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3" controlId="formFurnished">
                      <Form.Check type="checkbox" label="Furnished" name="furnished" data-group="addInfo" checked={form.addInfo.furnished} onChange={handleChange} />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3" controlId="formPetsAllowed">
                      <Form.Check type="checkbox" label="Pets Allowed" name="petsAllowed" data-group="addInfo" checked={form.addInfo.petsAllowed} onChange={handleChange} />
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-3" controlId="formDescription">
                  <Form.Label>Description</Form.Label>
                  <Form.Control as="textarea" rows={2} name="description" data-group="addInfo" value={form.addInfo.description} onChange={handleChange} />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formAmenities">
                  <Form.Label>Amenities (comma separated)</Form.Label>
                  <Form.Control type="text" name="amenities" data-group="addInfo" value={form.addInfo.amenities} onChange={handleChange} />
                </Form.Group>
                <h5 className="mt-3">Owner Contact</h5>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="formPhone">
                      <Form.Label>Phone</Form.Label>
                      <Form.Control type="text" name="phone" data-group="ownerContact" value={form.ownerContact.phone} onChange={handleChange} />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="formEmail">
                      <Form.Label>Email</Form.Label>
                      <Form.Control type="email" name="email" data-group="ownerContact" value={form.ownerContact.email} onChange={handleChange} />
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-3" controlId="formImages">
                  <Form.Label>Property Images</Form.Label>
                  <Form.Control type="file" name="images" multiple accept="image/*" onChange={handleImageChange} />
                  <Form.Text className="text-muted">You can upload up to 5 images.</Form.Text>
                </Form.Group>
                <div className="d-grid">
                  <Button variant="primary" type="submit">
                    Submit Property
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AddProperty; 