<?php

namespace App\Filament\Widgets;

use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use App\Models\User;

class StatsOverview extends StatsOverviewWidget
{
    protected function getStats(): array
    {
        return [
            Stat::make('Étudiants', User::where('role', 'student')->count())
                ->description('Comptes actifs et inscrits')
                ->icon('heroicon-o-users')
                ->color('success'),

            Stat::make('Cheikhs', User::where('role', 'cheikh')->where('status', 'active')->count())
                ->description('Enseignants validés')
                ->icon('heroicon-o-academic-cap')
                ->color('primary'),

            Stat::make('Demandes en attente', User::where('role', 'cheikh')->where('status', 'pending')->count())
                ->description('Cheikhs à valider')
                ->icon('heroicon-o-clock')
                ->color('warning'),
        ];
    }
}
