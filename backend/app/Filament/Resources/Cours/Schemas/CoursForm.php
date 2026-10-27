<?php

namespace App\Filament\Resources\Cours\Schemas;

use App\Models\Cheikh;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Components\Utilities\Set;
use Filament\Schemas\Schema;
use Illuminate\Database\Eloquent\Builder;

class CoursForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Informations du cours')
                    ->columns(2)
                    ->schema([
                        TextInput::make('titre')
                            ->required()
                            ->maxLength(255),
                        Select::make('cheikh_id')
                            ->label('Cheikh')
                            ->relationship(
                                name: 'cheikh',
                                titleAttribute: 'id',
                                modifyQueryUsing: fn (Builder $query) => $query->with('user'),
                            )
                            ->getOptionLabelFromRecordUsing(fn (Cheikh $record): string => trim(
                                "{$record->user?->prenom} {$record->user?->name}"
                            ))
                            ->searchable()
                            ->preload()
                            ->required()
                            ->live()
                            ->afterStateUpdated(function (Set $set): void {
                                $set('matiere_id', null);
                                $set('mahdara_id', null);
                            }),
                        Select::make('matiere_id')
                            ->label('Matière')
                            ->relationship(
                                name: 'matiere',
                                titleAttribute: 'nom',
                                modifyQueryUsing: fn (Builder $query, Get $get) => $query
                                    ->whereIn('actif', ['true', '1'])
                                    ->whereHas('cheikhs', fn (Builder $cheikhs) => $cheikhs
                                        ->whereKey($get('cheikh_id'))),
                            )
                            ->searchable()
                            ->preload()
                            ->disabled(fn (Get $get): bool => blank($get('cheikh_id')))
                            ->required(),
                        Select::make('mahdara_id')
                            ->label('Mahdara')
                            ->relationship(
                                name: 'mahdara',
                                titleAttribute: 'nom',
                                modifyQueryUsing: fn (Builder $query, Get $get) => $query->whereKey(
                                    Cheikh::query()->whereKey($get('cheikh_id'))->value('mahdara_id')
                                ),
                            )
                            ->searchable()
                            ->preload()
                            ->disabled(fn (Get $get): bool => blank($get('cheikh_id')))
                            ->required(),
                        TextInput::make('niveau')
                            ->label('Niveau')
                            ->required()
                            ->maxLength(100),
                        Select::make('type')
                            ->label('Type de cours')
                            ->options(['audio' => 'Audio', 'video' => 'Vidéo'])
                            ->default('audio')
                            ->required()
                            ->live(),
                        TextInput::make('langue')
                            ->label('Langue')
                            ->default('ar')
                            ->required()
                            ->maxLength(10),
                        TextInput::make('duree_secondes')
                            ->label('Durée (secondes)')
                            ->numeric()
                            ->minValue(1),
                        TextInput::make('taille_octets')
                            ->label('Taille (octets)')
                            ->numeric()
                            ->minValue(0),
                        TextInput::make('livre')
                            ->label('Livre')
                            ->maxLength(150),
                        Select::make('statut')
                            ->label('Publication')
                            ->options(['brouillon' => 'Brouillon', 'publie' => 'Publié'])
                            ->default('publie')
                            ->required()
                            ->live(),
                        DateTimePicker::make('publie_le')
                            ->label('Date de publication')
                            ->default(now())
                            ->visible(fn (Get $get): bool => $get('statut') === 'publie'),
                        Textarea::make('description')
                            ->label('Description')
                            ->rows(3)
                            ->columnSpanFull(),
                        Textarea::make('contenu')
                            ->label('Contenu du cours')
                            ->rows(8)
                            ->columnSpanFull(),
                    ]),
                Section::make('Fichiers du cours')
                    ->description('Téléversez les fichiers et le visuel du cours.')
                    ->schema([
                        FileUpload::make('fichier_path')
                            ->label(fn (Get $get): string => $get('type') === 'video'
                                ? 'Fichier vidéo'
                                : 'Fichier audio')
                            ->helperText(fn (Get $get): string => $get('type') === 'video'
                                ? 'Téléversez un fichier MP4 ou WebM.'
                                : 'Téléversez un fichier MP3 depuis votre ordinateur ou téléphone.')
                            ->acceptedFileTypes(fn (Get $get): array => $get('type') === 'video'
                                ? ['video/mp4', 'video/webm']
                                : ['audio/mpeg', 'audio/mp3'])
                            ->disk('public')
                            ->directory(fn (Get $get): string => $get('type') === 'video'
                                ? 'cours/videos'
                                : 'cours/audio')
                            ->visibility('public')
                            ->maxSize(102400)
                            ->required(),
                        FileUpload::make('image_path')
                            ->label('Image de couverture')
                            ->helperText('Une image JPG, PNG ou WebP avec aperçu avant enregistrement.')
                            ->image()
                            ->imageEditor()
                            ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp'])
                            ->disk('public')
                            ->directory('cours/couvertures')
                            ->visibility('public')
                            ->maxSize(5120),
                        FileUpload::make('extrait_path')
                            ->label('Extrait audio')
                            ->helperText('Téléversez un court extrait MP3. Cette option remplace l’URL externe ci-dessous.')
                            ->acceptedFileTypes(['audio/mpeg', 'audio/mp3'])
                            ->disk('public')
                            ->directory('cours/extraits')
                            ->visibility('public')
                            ->maxSize(20480)
                            ->live()
                            ->afterStateUpdated(fn (Set $set) => $set('extrait_url', null)),
                        TextInput::make('extrait_url')
                            ->label('Ou URL externe de l’extrait')
                            ->url()
                            ->maxLength(2048)
                            ->disabled(fn (Get $get): bool => filled($get('extrait_path')))
                            ->helperText('Renseignez une URL si l’extrait est déjà hébergé ailleurs.'),
                    ])
                    ->columns(2),
            ]);
    }
}
